// Copyright (C) 2016 Göteborgs Stad
//
// Denna programvara är fri mjukvara: den är tillåten att distribuera och modifiera
// under villkoren för licensen CC-BY-NC-SA 4.0.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the CC-BY-NC-SA 4.0 licence.
//
// http://creativecommons.org/licenses/by-nc-sa/4.0/
//
// Det är fritt att dela och anpassa programvaran för valfritt syfte
// med förbehåll att följande villkor följs:
// * Copyright till upphovsmannen inte modifieras.
// * Programvaran används i icke-kommersiellt syfte.
// * Licenstypen inte modifieras.
//
// Den här programvaran är öppen i syfte att den skall vara till nytta för andra
// men UTAN NÅGRA GARANTIER; även utan underförstådd garanti för
// SÄLJBARHET eller LÄMPLIGHET FÖR ETT VISST SYFTE.
//
// https://github.com/hajkmap/Hajk

import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/SaveSharp";
import { withStyles } from "@material-ui/core/styles";
import { blue } from "@material-ui/core/colors";
import { MenuItem, Select } from "@material-ui/core";

const ColorButtonBlue = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(blue[500]),
    backgroundColor: blue[500],
    "&:hover": {
      backgroundColor: blue[700],
    },
  },
}))(Button);

var defaultState = {
  validationErrors: [],
  active: false,
  index: 0,
  target: "toolbar",
  instruction: "",
  scales: "200, 400, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000",
  logo: "https://github.com/hajkmap/Hajk/raw/master/design/logo_small.png",
  northArrow: "",
  visibleForGroups: [],
  visibleAtStart: false,
  includeLogo: true,
  logoPlacement: "topRight",
  includeScaleBar: true,
  scaleBarPlacement: "bottomLeft",
  includeNorthArrow: true,
  northArrowPlacement: "topLeft",
};

class ToolOptions extends Component {
  /**
   *
   */
  constructor() {
    super();
    this.state = defaultState;
    this.type = "print";
  }

  componentDidMount() {
    var tool = this.getTool();
    if (tool) {
      this.setState({
        active: true,
        index: tool.index,
        target: tool.options.target || "toolbar",
        position: tool.options.position,
        width: tool.options.width,
        height: tool.options.height,
        instruction: tool.options.instruction,
        scales: tool.options.scales || this.state.scales,
        logo: tool.options.logo,
        northArrow: tool.options.northArrow || this.state.northArrow,
        visibleAtStart: tool.options.visibleAtStart,
        visibleForGroups: tool.options.visibleForGroups
          ? tool.options.visibleForGroups
          : [],
        includeLogo:
          tool.options.includeLogo === "boolean"
            ? tool.options.includeLogo
            : this.state.includeLogo,
        logoPlacement: tool.options.logoPlacement || this.state.logoPlacement,
        includeScaleBar:
          tool.options.includeScaleBar === "boolean"
            ? tool.options.includeScaleBar
            : this.state.includeScaleBar,
        scaleBarPlacement:
          tool.options.scaleBarPlacement || this.state.scaleBarPlacement,
        includeNorthArrow:
          tool.options.includeNorthArrow === "boolean"
            ? tool.options.includeNorthArrow
            : this.state.includeNorthArrow,
        northArrowPlacement:
          tool.options.northArrowPlacement || this.state.northArrowPlacement,
      });
    } else {
      this.setState({
        active: false,
      });
    }
  }

  componentWillUnmount() {}
  /**
   *
   */
  componentWillMount() {}

  handleInputChange(event) {
    var target = event.target;
    var name = target.name;
    var value = target.type === "checkbox" ? target.checked : target.value;
    if (typeof value === "string" && value.trim() !== "") {
      value = !isNaN(Number(value)) ? Number(value) : value;
    }
    if (name === "instruction") {
      value = btoa(value);
    }
    this.setState({
      [name]: value,
    });
  }

  getTool() {
    return this.props.model
      .get("toolConfig")
      .find((tool) => tool.type === this.type);
  }

  add(tool) {
    this.props.model.get("toolConfig").push(tool);
  }

  remove(tool) {
    this.props.model.set({
      toolConfig: this.props.model
        .get("toolConfig")
        .filter((tool) => tool.type !== this.type),
    });
  }

  replace(tool) {
    this.props.model.get("toolConfig").forEach((t) => {
      if (t.type === this.type) {
        t.options = tool.options;
        t.index = tool.index;
        t.instruction = tool.instruction;
      }
    });
  }

  save() {
    var tool = {
      type: this.type,
      index: this.state.index,
      options: {
        target: this.state.target,
        position: this.state.position,
        width: this.state.width,
        height: this.state.height,
        scales: this.state.scales,
        logo: this.state.logo,
        northArrow: this.state.northArrow,
        instruction: this.state.instruction,
        visibleAtStart: this.state.visibleAtStart,
        visibleForGroups: this.state.visibleForGroups.map(
          Function.prototype.call,
          String.prototype.trim
        ),
        includeLogo: this.state.includeLogo,
        logoPlacement: this.state.logoPlacement,
        includeScaleBar: this.state.includeScaleBar,
        scaleBarPlacement: this.state.scaleBarPlacement,
        includeNorthArrow: this.state.includeNorthArrow,
        northArrowPlacement: this.state.northArrowPlacement,
      },
    };

    var existing = this.getTool();

    function update() {
      this.props.model.updateToolConfig(
        this.props.model.get("toolConfig"),
        () => {
          this.props.parent.props.parent.setState({
            alert: true,
            alertMessage: "Uppdateringen lyckades",
          });
        }
      );
    }

    if (!this.state.active) {
      if (existing) {
        this.props.parent.props.parent.setState({
          alert: true,
          confirm: true,
          alertMessage:
            "Verktyget kommer att tas bort. Nuvarande inställningar kommer att gå förlorade. Vill du fortsätta?",
          confirmAction: () => {
            this.remove();
            update.call(this);
            this.setState(defaultState);
          },
        });
      } else {
        this.remove();
        update.call(this);
      }
    } else {
      if (existing) {
        this.replace(tool);
      } else {
        this.add(tool);
      }
      update.call(this);
    }
  }

  handleAuthGrpsChange(event) {
    const target = event.target;
    const value = target.value;
    let groups = [];

    try {
      groups = value.split(",");
    } catch (error) {
      console.log(`Någonting gick fel: ${error}`);
    }

    this.setState({
      visibleForGroups: value !== "" ? groups : [],
    });
  }

  renderVisibleForGroups() {
    if (this.props.parent.props.parent.state.authActive) {
      return (
        <div>
          <label htmlFor="visibleForGroups">Tillträde</label>
          <input
            id="visibleForGroups"
            value={this.state.visibleForGroups}
            type="text"
            name="visibleForGroups"
            onChange={(e) => {
              this.handleAuthGrpsChange(e);
            }}
          />
        </div>
      );
    } else {
      return null;
    }
  }

  renderPlacementSelect = (currentValue, name) => {
    return (
      <Select
        id={name}
        name={name}
        className="control-fixed-width"
        value={currentValue}
        onChange={(e) => {
          this.handleInputChange(e);
        }}
      >
        <MenuItem value={"topLeft"}>Uppe till vänster</MenuItem>
        <MenuItem value={"topRight"}>Uppe till höger</MenuItem>
        <MenuItem value={"bottomRight"}>Nere till höger</MenuItem>
        <MenuItem value={"bottomLeft"}>Nere till vänster</MenuItem>
      </Select>
    );
  };

  renderIncludeSelect = (currentValue, name) => {
    return (
      <Select
        id={name}
        name={name}
        value={currentValue}
        className="control-fixed-width"
        onChange={(e) => {
          this.handleInputChange(e);
        }}
      >
        <MenuItem value={true}>Ja</MenuItem>
        <MenuItem value={false}>Nej</MenuItem>
      </Select>
    );
  };

  /**
   *
   */
  render() {
    return (
      <div>
        <form>
          <p>
            <ColorButtonBlue
              variant="contained"
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                this.save();
              }}
              startIcon={<SaveIcon />}
            >
              Spara
            </ColorButtonBlue>
          </p>
          <div className="information-box">
            Tänk på att öka minnesanvändningen i GeoServer för WMS om du
            använder detta verktyg. Utskrifter med hög DPI och SingeTile kräver
            mycket minne. Standard för GeoServer är 128MB och det är inte säkert
            det räcker för att alla requests ska returneras korrekt. <br />
            <div className="separator">För att ändra minnesanvändningen</div>
            Logga in i GeoServer > Tjänster > WMS > Gränser för
            resursförbrukning > Max renderingsminne (KB)
          </div>
          <div>
            <input
              id="active"
              name="active"
              type="checkbox"
              onChange={(e) => {
                this.handleInputChange(e);
              }}
              checked={this.state.active}
            />
            &nbsp;
            <label htmlFor="active">Aktiverad</label>
          </div>

          <div className="separator">Fönsterinställningar</div>
          <div>
            <label htmlFor="index">Sorteringsordning</label>
            <input
              id="index"
              name="index"
              type="number"
              min="0"
              className="control-fixed-width"
              onChange={(e) => {
                this.handleInputChange(e);
              }}
              value={this.state.index}
            />
          </div>
          <div>
            <label htmlFor="target">Verktygsplacering</label>
            <select
              id="target"
              name="target"
              className="control-fixed-width"
              onChange={(e) => {
                this.handleInputChange(e);
              }}
              value={this.state.target}
            >
              <option value="toolbar">Drawer</option>
              <option value="left">Widget left</option>
              <option value="right">Widget right</option>
              <option value="control">Control button</option>
            </select>
          </div>
          <div>
            <label htmlFor="position">
              Fönsterplacering{" "}
              <i
                className="fa fa-question-circle"
                data-toggle="tooltip"
                title="Placering av verktygets fönster. Anges som antingen 'left' eller 'right'."
              />
            </label>
            <select
              id="position"
              name="position"
              className="control-fixed-width"
              onChange={(e) => {
                this.handleInputChange(e);
              }}
              value={this.state.position}
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <label htmlFor="width">
              Fönsterbredd{" "}
              <i
                className="fa fa-question-circle"
                data-toggle="tooltip"
                title="Bredd i pixlar på verktygets fönster. Anges som ett numeriskt värde. Lämna tomt för att använda standardbredd."
              />
            </label>
            <input
              id="width"
              name="width"
              type="number"
              min="0"
              className="control-fixed-width"
              onChange={(e) => {
                this.handleInputChange(e);
              }}
              value={this.state.width}
            />
          </div>
          <div>
            <label htmlFor="height">
              Fönsterhöjd{" "}
              <i
                className="fa fa-question-circle"
                data-toggle="tooltip"
                title="Höjd i pixlar på verktygets fönster. Anges som ett numeriskt värde. Lämna tomt för att använda maximal höjd."
              />
            </label>
            <input
              id="height"
              name="height"
              type="number"
              min="0"
              className="control-fixed-width"
              onChange={(e) => {
                this.handleInputChange(e);
              }}
              value={this.state.height}
            />
          </div>
          <div className="separator">Inställningar för utskrift</div>
          <div>
            <label htmlFor="scales">Skalor</label>
            <input
              type="text"
              name="scales"
              value={this.state.scales}
              onChange={(e) => {
                this.handleInputChange(e);
              }}
            />
          </div>
          <div>
            <label htmlFor="logo">
              Logo{" "}
              <i
                className="fa fa-question-circle"
                data-toggle="tooltip"
                title="Sökväg till logga att använda i utskrifterna. Kan vara relativ Hajk-root eller absolut."
              />
            </label>
            <input
              type="text"
              name="logo"
              value={this.state.logo}
              onChange={(e) => {
                this.handleInputChange(e);
              }}
            />
          </div>
          <div>
            <label htmlFor="includeLogo">
              Inkludera logga{" "}
              <i
                className="fa fa-question-circle"
                data-toggle="tooltip"
                title="Inställning för om loggan skall inkluderas som standard. Användarna kan ändra detta själva."
              />
            </label>
            {this.renderIncludeSelect(this.state.includeLogo, "includeLogo")}
          </div>
          <div>
            <label htmlFor="logoPlacement">
              Logoplacering{" "}
              <i
                className="fa fa-question-circle"
                data-toggle="tooltip"
                title="Inställning för loggans standardplacering. Användarna kan ändra detta själva."
              />
            </label>
            {this.renderPlacementSelect(
              this.state.logoPlacement,
              "logoPlacement"
            )}
          </div>
          <div>
            <label htmlFor="logo">
              Norrpil{" "}
              <i
                className="fa fa-question-circle"
                data-toggle="tooltip"
                title="Sökväg till norrpil att använda i utskrifterna. Kan vara relativ Hajk-root eller absolut."
              />
            </label>
            <input
              type="text"
              name="northArrow"
              value={this.state.northArrow}
              onChange={(e) => {
                this.handleInputChange(e);
              }}
            />
          </div>
          <div>
            <label htmlFor="includeNorthArrow">
              Inkludera norrpil{" "}
              <i
                className="fa fa-question-circle"
                data-toggle="tooltip"
                title="Inställning för om norrpilen skall inkluderas som standard. Användarna kan ändra detta själva."
              />
            </label>
            {this.renderIncludeSelect(
              this.state.includeNorthArrow,
              "includeNorthArrow"
            )}
          </div>
          <div>
            <label htmlFor="logoPlacement">
              Norrpilsplacering{" "}
              <i
                className="fa fa-question-circle"
                data-toggle="tooltip"
                title="Inställning för norrpilens standardplacering. Användarna kan ändra detta själva."
              />
            </label>
            {this.renderPlacementSelect(
              this.state.northArrowPlacement,
              "northArrowPlacement"
            )}
          </div>
          <div>
            <label htmlFor="includeScaleBar">
              Inkludera skalstock{" "}
              <i
                className="fa fa-question-circle"
                data-toggle="tooltip"
                title="Inställning för om skalstocken skall inkluderas som standard. Användarna kan ändra detta själva."
              />
            </label>
            {this.renderIncludeSelect(
              this.state.includeScaleBar,
              "includeScaleBar"
            )}
          </div>
          <div>
            <label htmlFor="logoPlacement">
              Skalstocksplacering{" "}
              <i
                className="fa fa-question-circle"
                data-toggle="tooltip"
                title="Inställning för skalstockens standardplacering. Användarna kan ändra detta själva."
              />
            </label>
            {this.renderPlacementSelect(
              this.state.scaleBarPlacement,
              "scaleBarPlacement"
            )}
          </div>
          <div className="separator">Övriga inställningar</div>
          <div>
            <input
              id="visibleAtStart"
              name="visibleAtStart"
              type="checkbox"
              onChange={(e) => {
                this.handleInputChange(e);
              }}
              checked={this.state.visibleAtStart}
            />
            &nbsp;
            <label htmlFor="visibleAtStart">Synlig vid start</label>
          </div>
          <div>
            <label htmlFor="instruction">
              Instruktion{" "}
              <i
                className="fa fa-question-circle"
                data-toggle="tooltip"
                title="Visas som tooltip vid mouseover på verktygsknappen"
              />
            </label>
            <textarea
              type="text"
              id="instruction"
              name="instruction"
              onChange={(e) => {
                this.handleInputChange(e);
              }}
              value={
                this.state.instruction
                  ? atob(this.state.instruction)
                  : "Utskriften sker på klienten och inte på servern som den gamla gjorde."
              }
            />
          </div>
          {this.renderVisibleForGroups()}
        </form>
      </div>
    );
  }
}

export default ToolOptions;
