import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style.js";
import { Vector as VectorSource } from "ol/source.js";
import { Vector as VectorLayer } from "ol/layer.js";
import { LineString, Polygon } from "ol/geom.js";
import Draw, { createBox } from "ol/interaction/Draw.js";
import Overlay from "ol/Overlay";

class DrawModel {
  constructor(settings) {
    this.map = settings.map;
    this.app = settings.app;
    this.localObserver = settings.localObserver;
    this.source = new VectorSource();
    this.vector = new VectorLayer({
      source: this.source,
      style: this.createStyle
    });
    this.map.addLayer(this.vector);
    this.type = "LineString";
    this.displayText = false;
    this.createDrawTooltip();
    this.strokeColor = "rgba(0, 0, 0, 0.5)";
    this.strokeWidth = 3;
  }

  redraw() {
    this.vector.changed();
  }

  createStyle = (feature, resolution) => {
    const displayLabel = feature && feature.getProperties().type === "Label";
    return [
      new Style({
        fill: new Fill({
          color: "rgba(255, 255, 255, 0.3)"
        }),
        stroke: new Stroke({
          color: this.strokeColor,
          width: this.strokeWidth
        }),
        image: displayLabel
          ? null
          : new CircleStyle({
              radius: 5,
              stroke: new Stroke({
                color: "rgba(0, 0, 0, 0.7)"
              }),
              fill: new Fill({
                color: "rgba(255, 255, 255, 0.2)"
              })
            }),
        text: new Text({
          textAlign: "center",
          textBaseline: "middle",
          font: "12pt sans-serif",
          fill: new Fill({ color: "#FFF" }),
          text: feature && this.getLabelText(feature),
          overflow: true,
          stroke: new Stroke({
            color: "rgba(0, 0, 0, 0.5)",
            width: 3
          }),
          offsetX: 0,
          offsetY: 0,
          rotation: 0,
          scale: 1
        })
      })
    ];
  };

  clear = () => {
    this.source.clear();
    this.drawTooltip.setPosition(undefined);
  };

  handleDrawStart = e => {
    e.feature.getGeometry().on("change", e => {
      var toolTip = "",
        coord = undefined,
        pointerCoord;

      if (this.active) {
        if (this.pointerPosition) {
          pointerCoord = this.pointerPosition.coordinate;
        }

        if (e.target instanceof LineString) {
          toolTip = this.formatLabel("length", e.target.getLength());
          coord = e.target.getLastCoordinate();
        }

        if (e.target instanceof Polygon) {
          toolTip = this.formatLabel("area", e.target.getArea());
          coord = pointerCoord || e.target.getFirstCoordinate();
        }

        this.drawTooltipElement.innerHTML = toolTip;
        this.drawTooltip.setPosition(coord);
      }
    });
  };

  handleDrawEnd = e => {
    if (this.text) {
      this.localObserver.emit("dialog", e.feature);
    }
    this.setFeaturePropertiesFromGeometry(e.feature);
    this.drawTooltip.setPosition(undefined);
  };

  setType(type) {
    this.type = type;
    this.removeInteraction();
    this.addInteraction();
  }

  removeInteraction() {
    this.drawTooltip.setPosition(undefined);
    this.map.removeInteraction(this.draw);
  }

  setFeaturePropertiesFromGeometry(feature) {
    if (!feature) return;
    var geom,
      type = "",
      length = 0,
      radius = 0,
      area = 0,
      position = {
        n: 0,
        e: 0
      };
    geom = feature.getGeometry();
    type = geom.getType();
    switch (type) {
      case "Point":
        position = {
          n: Math.round(geom.getCoordinates()[1]),
          e: Math.round(geom.getCoordinates()[0])
        };
        break;
      case "LineString":
        length = Math.round(geom.getLength());
        break;
      case "Polygon":
        area = Math.round(geom.getArea());
        break;
      case "Circle":
        radius = Math.round(geom.getRadius());
        break;
      default:
        break;
    }
    feature.setProperties({
      type: type,
      user: true,
      length: length,
      area: area,
      radius: radius,
      position: position
    });
  }

  formatLabel(type, value) {
    var label;

    if (type === "text") {
      label = value;
    }

    if (type === "point") {
      label = "Nord: " + value[0] + " Öst: " + value[1];
    }

    if (typeof value === "number") {
      value = Math.round(value);
    }

    if (type === "circle") {
      let prefix = " m";
      let prefixSq = " m²";
      if (value >= 1e3) {
        prefix = " km";
        value = value / 1e3;
      }
      label =
        "R = " +
        value +
        prefix +
        " \nA = " +
        Math.round(value * value * Math.PI * 1e3) / 1e3 +
        prefixSq;
    }

    if (type === "area") {
      let prefix = " m²";
      if (value >= 1e6) {
        prefix = " km²";
        value = Math.round((value / 1e6) * 1e3) / 1e3;
      }
      label = value + prefix;
    }

    if (type === "length") {
      let prefix = " m";
      if (value >= 1e3) {
        prefix = " km";
        value = value / 1e3;
      }
      label = value + prefix;
    }

    return label;
  }

  createDrawTooltip() {
    if (this.drawTooltipElement) {
      this.drawTooltipElement.parentNode.removeChild(this.drawTooltipElement);
    }
    this.drawTooltipElement = document.createElement("div");
    this.drawTooltipElement.className = "tooltip-draw tooltip-Draw";
    this.drawTooltip = new Overlay({
      element: this.drawTooltipElement,
      offset: [0, -15],
      positioning: "bottom-center"
    });
    if (this.displayText) {
      this.map.addOverlay(this.drawTooltip);
    }
  }

  getLabelText(feature) {
    const props = feature.getProperties();
    const type = feature.getProperties().type;
    switch (type) {
      case "LineString":
        return this.displayText
          ? this.formatLabel("length", props.length)
          : null;
      case "Polygon":
        return this.displayText ? this.formatLabel("area", props.area) : null;
      case "Label":
        return this.formatLabel("text", props.text);
      default:
        return "";
    }
  }

  addInteraction() {
    var geometryFunction;
    this.text = false;
    if (this.type === "Text") {
      this.type = "Point";
      this.text = true;
    }
    if (this.type === "Square") {
      this.type = "Circle";
      geometryFunction = createBox();
    }
    this.draw = new Draw({
      source: this.source,
      type: this.type,
      style: this.createStyle(),
      geometryFunction: geometryFunction
    });
    this.draw.on("drawstart", this.handleDrawStart);
    this.draw.on("drawend", this.handleDrawEnd);
    this.map.addInteraction(this.draw);
  }

  setActive(active) {
    if (active && !this.active) {
      this.addInteraction();
    }
    if (active === false) {
      this.removeInteraction();
    }
    this.active = active;
  }

  getMap() {
    return this.map;
  }
}

export default DrawModel;