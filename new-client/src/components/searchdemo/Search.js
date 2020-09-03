/**
 * BRIEF DESCRIPTION
 * =================
 *
 * --- SEARCH MODEL ---
 * App initiates the search model so it's available to the rest of the application,
 * probably exposed as "this.app.searchModel" from our plugin's perspective.
 *
 * The Search Model (this.app.searchModel) exposes the following methods:
 *  async doAutocompleteLookup(text)
 *  async doSearch([searchString string], [spatialFilter geom])
 *  abort() // both autocomplete and search, or separate abort methods for each of them?
 *
 * The Search Model reads the map config and sets up WFS search sources.
 *
 * Any search plugin (whether Hajk's standard or some other implementation) can use
 * Search Model in a following manner:
 *  - User starts typing. For each searchField.onChange-event our plugin
 *    calls "await this.app.searchModel.doAutocompleteLookup(searchField.value)".
 *  - When autocomplete results arrive they are handled and rendered properly, as
 *    desired by the given plugin. Please note that the autocomplete could also be
 *    skipped entirely.
 *  - Next user can do something that will mean that our plugin wants to invoke
 *    the actual search. (It could be that user clicks the search button, presses enter
 *    or clicks on a autocomplete item.) When this happens, our plugin calls
 *    "await this.app.searchModel.doSearch()" with proper parameters.
 *      - If we're just doing regular search, we supply the value of
 *        search field as parameter to doSearch().
 *      - If we want to limit the search spatially, we (somehow) read the geom
 *        and supply as a second parameter to doSearch().
 *      - If we want to search in visible layers only, we must be able to send
 *        that info to our search model too. Could be done by getting the list
 *        visible layers from our ol.Map, and supplying that array as an option
 *        to doSearch(). In that case, doSearch will filter search sources to
 *        only include those that are supplied in this array of visible layers.
 *  - No matter which of the above is used, calling "await this.app.searchModel.doSearch()"
 *    will always resolve into a Promise that contains some data: the search results. Those
 *    must be displayed for the user somehow. (It could also be that we want to do something
 *    more, such as zoom into the first result. But implementation of that functionality should
 *    be done in each specific search plugin.)
 *  - So at this step, we have got some results back to our plugin and those are ready
 *    to be displayed for the user. Our search plugin takes care of this by looping the
 *    resulting object, styling and formatting and finally rendering the results list.
 *  - It is up to the plugin as well to set up listeners for items in the results list. One
 *    common listener would be a click listener on each item that will zoom in to the
 *    clicked result.
 *  - Each search plugin should be able to abort any ongoing search. This is achieved by calling
 *    this.app.searchModel.abort() at any given time. It is, of course, up to the search plugin
 *    to implement necessary UI element (typically a button) that will abort ongoing searches.
 *  - Please note that clearing the search results is NOT something that the Search Model should
 *    care about. Instead it's entirely up to the implementing plugin to handle different user
 *    actions (and hiding the results list is such an action). **The Search Model must only care
 *    about supplying autocomplete, supplying search results and aborting those two.**
 *
 *
 * --- SEARCH COMPONENT ---
 *
 * App loads this Component if so configured by admin.
 *
 * Search Component enters the constructor phase.
 *
 * Listeners and event handlers are setup.
 *
 * Listeners:
 *  search.populateAutocomplete
 *  search.populateResultsList
 *  search.addFunctionality
 *
 * Event handlers:
 *  User types -> search.stringChanged
 *  User aborts search -> search.aborted
 *  ...
 *
 * --- PLUGIN WITH SEARCH FUNCTIONALITY ---
 *
 * Plugins are loaded by app. If plugin wants to expose
 * search functionality, add something or in some way take
 * care of search results, the following must be implemented
 * the plugin.
 *
 * Plugin subscribes to minimum these events:
 *  search.stringChanged
 *  search.aborted
 *
 * This way the plugin knows whether user types into search box
 * or cancels the search. From here, plugin can take care of whatever
 * it whishes to do with the current value of search field. The
 * normal thing would be that it reads the value, does some magic
 * and then gets some results back.
 *
 * In this case, the results must be sent back to Search in a
 * standardized manner. For this the plugin publishes this event:
 *  search.populateAutocomplete
 * if we have implemented autocomplete and have something to offer, or:
 *  search.populateResultsList
 * if user have pressed "search" and we want the actual results
 * and not only autocomplete values.
 *
 * The values sent back must be standardized. Perhaps something like this:
 * [{
 *  label: string
 *  geom: // whatever to mark/select in map
 * }, ...]
 */

//
// *https://www.registers.service.gov.uk/registers/country/use-the-api*
import React from "react";
import SearchBar from "./SearchBar";
import { withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  search: {
    borderRadius: theme.shape.borderRadius,
    flex: "auto",
    display: "flex",
    height: "100%",
  },
  inputRoot: {
    width: "100%",
  },
  inputInput: {
    padding: theme.spacing(1),
    left: "100%",
    width: "100%",
  },
  inputInputWide: {
    padding: theme.spacing(1),
    left: "100%",
    width: "100%",
    "&:focus": {
      width: "100%",
    },
  },
});

class Search extends React.PureComponent {
  render() {
    const { classes, target } = this.props;

    return (
      <>
        <SearchBar
          classes={{
            root: classes.inputRoot,
            input:
              target === "top" ? classes.inputInputWide : classes.inputInput,
          }}
          {...this.props}
        />
      </>
    );
  }
}
export default withStyles(styles)(Search);