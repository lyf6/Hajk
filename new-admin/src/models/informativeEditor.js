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

import { Model } from "backbone";

var informativeEditor = Model.extend({
  setParentChapter: function setParentChapter(chapter, parent) {
    chapter.parent = parent;
    if (chapter.chapters.length > 0) {
      chapter.chapters.forEach(child => {
        setParentChapter(child, chapter);
      });
    }
  },

  deleteParentChapter: function deleteParentChapter(chapter, parent) {
    delete chapter.parent;
    if (chapter.chapters.length > 0) {
      chapter.chapters.forEach(child => {
        deleteParentChapter(child, chapter);
      });
    }
  },

  delete: function(documentName, callback) {
    var url = this.get("config").url_delete + "/" + documentName;
    fetch(url, {
      method: "delete"
    }).then(response => {
      callback(response);
    });
  },

  save: function(documentName, data, callback) {
    var url = this.get("config").url_save + "/" + documentName;
    data.chapters.forEach(chapter => {
      this.deleteParentChapter(chapter, data.chapters);
    });
    fetch(url, {
      method: "post",
      body: JSON.stringify(data)
    }).then(response => {
      response.text().then(text => {
        callback(text);
      });
    });
  },

  loadDocuments: function(callback) {
    var url = this.get("config").url_document_list;
    fetch(url).then(response => {
      response.json().then(data => {
        callback(data);
      });
    });
  },

  createDocument(data, callback) {
    var url = this.get("config").url_create;
    fetch(url, {
      method: "post",
      body: JSON.stringify(data)
    }).then(response => {
      response.text().then(text => {
        callback(text);
      });
    });
  },

  load: function(documentName, callback) {
    var url = this.get("config").url_load + "/" + documentName;
    fetch(url).then(response => {
      response.json().then(data => {
        data.chapters.forEach(chapter => {
          this.setParentChapter(chapter, data.chapters);
        });
        callback(data);
      });
    });
  },

  loadMaps: function(callback) {
    var url = this.get("config").url_map_list;
    fetch(url).then(response => {
      response.json().then(data => {
        callback(data);
      });
    });
  }
});

export default informativeEditor;