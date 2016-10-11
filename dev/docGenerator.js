class DocGenerator {
  constructor(data, options = {}) {
    thisObject = this;
    /* ======== Check and import the data ======== */
    this.definition = null;
    switch (data.constructor) {
    case String:
      this.loadDefinitionFile(data).then(function (r) {
        thisObject.definition = r;
      });
      break;
    case Object:
      this.definition = data;
      break;
    case Array:
      this.definition = data;
      break;
    default:
      throw new Error("DocGenerator.constructor: data needs to be either a string, and object or an array.");
    }

    /* ======== Default options ======== */

    this.COLOR_MAIN = "rgb(134,32,4)";
    this.COLOR_MAIN_LIGHTER = "rgb(252,227,184)";
    this.COLOR_NON_LAB_MEETINGS_BLUE = "rgb(19,63,84)";
    this.COLOR_NON_LAB_MEETINGS_LIGHTBLUE = "rgb(221, 238, 249)";

    var baseOptions = {
      boxElement: null,
      title: "DocGenerator",
      boxClass: "doc-generator-container",
      dotToLine: true // in the description a dot means going to the next line 

    };

    options = _.extend(baseOptions, options);

    this.options = options;

    if (!options.boxElement) {
      // check if the box already exists, else create it 
      // get a unique ID for the box
      this.boxId = "doc-generator-container" + ($("." + options.boxClass).length + 1);

      // html for creation
      this.boxHTML = '<div id="' + this.boxId + '" class="' + options.boxClass + '"></div>';

      $(document.body).append(this.boxHTML);
      this.boxElement = $("#" + this.boxId);
    } else {
      this.boxId = $(this.boxElement).attr("id");
    }

    /* ======== Load templates ======== */

    this.viewPaths = {
      container: "./templates/container.html",
      menuParent: "./templates/menu-parent-item.html",
      menuChild: "./templates/menu-child-item.html",
      oneVariable: "./templates/content-one-variable.html"
    };

    this.loaded = false;
    var thisObject = this;
    this.templateManager = new TemplateManager(this.viewPaths, function () {
      thisObject.loaded = true;
      if (thisObject.definition !== null) {
        thisObject.generateHTML();
      } else {
        settimeout(thisObject.generateHTML(), 2000);
      }
    });

  }

  /* ======== Load definition csv ======== */
  loadDefinitionFile(data) {
    var thisObject = this;
    return new Promise(function (resolve, reject) {
      $.get(data, function (raw) {
        resolve($.csv.toObjects(raw));
      });
    });
  }

  generateHTML() {
    var menuParents = "";
    var contentVariables = "";
    for (var i = 0; i < this.definition.length; i++) {
      var fields = this.formatForTemplate(this.definition[i], "parent", i);
      menuParents += this.templateManager.render("menuParent", fields);
      contentVariables += this.templateManager.render("oneVariable", fields);
    }

    var containerVariables = {
      title: "<b>Pipeline_doc</b>",
      content: contentVariables,
      menuContent: menuParents,
      footer: "pipeline_r"
    };

    this.templateManager.renderInTarget("container", containerVariables, this.boxElement);

    $(".doc-generator-menu-parent-item-link").click(function (e) {
      $("#" + e.target.id + ".doc-generator-content-variable-container").toggle();
    });
    // TODO
  }

  append(html, to = ".doc-generator-content", wrapInDivClass = null) {
    // append html to the selected child element of the dragbox
    if (this.boxElement) {
      if (wrapInDivClass !== null) {
        html = '<div class="' + wrapInDivClass + '" >' + html + "</div>";
      }

      if ((!to) || (to != "boxElement")) {
        this.boxElement.find(to).append(html);
      } else {
        this.boxElement.append(html);
      }

    }
  }

  // /* ======== Generate functions ======== */
  // generatePlanning(fromDate = null, toDate = null, renderType = "preview", type = this.EVENT_LABMEETING) {
  //   if (fromDate === null) {
  //     fromDate = new Date();
  //   }

  //   if (toDate === null) {
  //     toDate = (_.maxBy(this.labMeetings, function (labMeeting) {
  //       return (labMeeting.dateObject.valueOf());
  //     })).dateObject;
  //   }

  //   var fromValue = fromDate.valueOf();
  //   var toValue = toDate.valueOf() + 43200000;

  //   var filteredLabMeetings = _.filter(this.labMeetings, function (labMeeting) {
  //     var dateValue = labMeeting.dateObject.valueOf();
  //     if (type === "ALL") {
  //       return ((dateValue >= fromValue) && (dateValue <= toValue));
  //     } else {
  //       return ((dateValue >= fromValue) && (dateValue <= toValue) && (labMeeting.type === type));
  //     }

  //   });

  //   filteredLabMeetings = _.sortBy(filteredLabMeetings, [function (meeting) {
  //     return meeting.dateObject.valueOf();
  //   }]);

  //   var eventsString = "";
  //   for (var i = 0; i < filteredLabMeetings.length; i++) {
  //     var variables = this.formatForTemplate(filteredLabMeetings[i]);
  //     eventsString += this.templateManager.render("planningOneEvent", variables) + "<br/>";
  //   }

  //   var typeString = (type === this.EVENT_LABMEETING) ? "Meetings" : "Events";

  //   var render = window.open("about:blank", "LabMeeting", "width=600,height=800");
  //   if (renderType === "preview") {
  //     render.document.open("text/html", "replace");
  //     render.document.write(this.templateManager.render("planning", {
  //       type: typeString,
  //       events: eventsString
  //     }));
  //     render.document.close();
  //   } else {
  //     render.document.body.innerText = this.templateManager.render("planning", {
  //       type: typeString,
  //       events: eventsString
  //     });
  //   }
  // }

  // generateHTMLPage(name = null, renderType = "preview") {
  //   if (this.loaded === false) {
  //     throw new Error("generateMail: templates are not loaded yet.");
  //   }

  //   if (name === null) {
  //     var selectInput = document.getElementWithClass("select-name");
  //     if (selectInput.length != 0) {
  //       name = selectInput.value;
  //     } else {
  //       throw new Error("generateMail: no name selected");
  //     }
  //   }

  //   var labMeeting = _.find(this.labMeetings, {
  //     "name": name
  //   })
  //   if (typeof labMeeting === "undefined") {
  //     throw new Error("generateMail: invalid name, not found in the labMeetings array.");
  //   }

  //   var render = window.open("about:blank", "LabMeeting", "width=600,height=800");
  //   if (renderType === "preview") {
  //     render.document.open("text/html", "replace");
  //     render.document.write(this.templateManager.render("singleLabMeeting", this.formatForTemplate(labMeeting)));
  //     render.document.close();
  //   } else {
  //     render.document.body.innerText = this.templateManager.render("singleLabMeeting", this.formatForTemplate(labMeeting));
  //   }

  // }

  formatForTemplate(variable, parent = true, id = mandatory()) {

    var color, lightColor;
    // if (parent) {

    //   var color = this.COLOR_MAIN;
    //   var lightColor = this.COLOR_MAIN_LIGHTER;
    // } else {

    var color = this.COLOR_NON_LAB_MEETINGS_BLUE;
    var lightColor = this.COLOR_NON_LAB_MEETINGS_LIGHTBLUE;
    // }

    var fields = {
      id: id,
      itemName: variable.variable_name,
      childrenItems: "",
      type: variable.variable_type,
      name: variable.variable_name,
      formatedName: variable.formatted_name,
      isSubjectID: variable.is_subject_id,
      isGroupVariable: variable.is_group_variable,
      description: variable.description,
      color: color,
      lightColor: lightColor
    };

    return fields;
  }

  formatReferencesForTemplate(references) {
    if (references.constructor !== Array) {
      if (typeof references.url !== "undefined") {
        references = [references];
      } else {
        throw new Error("LabMeeting.formatReferencesForTemplate: references has to be in the format of [{name:, url:}]");
      }
    }

    var formatedReferences = "";
    for (var i = 0; i < references.length; i++) {
      formatedReferences += this.templateManager.render("reference", {
        name: references[i].name,
        url: references[i].url
      });
    }

    return (formatedReferences);
  }

  /* ======== Helper functions ======== */

  getDates(dateStart, dateEnd) {
    var currentDate = dateStart,
      dates = [];
    while (currentDate <= dateEnd) {

      // append date to array
      dates.push(currentDate);

      // add one day
      // automatically rolling over to next month
      var d = new Date(currentDate.valueOf());
      d.setDate(d.getDate() + 1);
      currentDate = d;

    }

    return dates;
  }

  filterWeekDays(dates, includeDays) {
    var weekdays = [];

    // cycle dates
    dates.forEach(function (day) {
      var dayIndex = day.getDay();
      // cycle days to be included (su==0, mo==1, etc.)
      includeDays.forEach(function (include) {
        if (dayIndex === include) {
          weekdays.push(day);
        }
      });
    });

    return weekdays;
  }

  htmlEncode(str) {
    var i = str.length,
      aRet = [];

    while (i--) {
      var iC = str[i].charCodeAt();
      if (iC < 65 || iC > 127 || (iC > 90 && iC < 97)) {
        aRet[i] = '&#' + iC + ';';
      } else {
        aRet[i] = str[i];
      }
    }
    return aRet.join('');
  }

}