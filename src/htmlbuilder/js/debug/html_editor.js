/**
 * Created by THANG NGUYEN (tan@vn.sateraito.co.jp) on 2014/11/02.
 * Updated: 2016-06-16
 */

$(function () {

  EventClass = (function () {
    var add,	// add event listener
      remove;	// remove event listener

    // http://msdn.microsoft.com/en-us/scriptjunkie/ff728624
    // http://www.javascriptrules.com/2009/07/22/cross-browser-event-listener-with-design-patterns/
    // http://www.quirksmode.org/js/events_order.html

    // add event listener
    add = function (obj, eventName, handler) {
      if (obj.addEventListener) {
        // (false) register event in bubble phase (event propagates from from target element up to the DOM root)
        obj.addEventListener(eventName, handler, false);
      }
      else if (obj.attachEvent) {
        obj.attachEvent('on' + eventName, handler);
      }
      else {
        obj['on' + eventName] = handler;
      }
    };

    // remove event listener
    remove = function (obj, eventName, handler) {
      if (obj.removeEventListener) {
        obj.removeEventListener(eventName, handler, false);
      }
      else if (obj.detachEvent) {
        obj.detachEvent('on' + eventName, handler);
      }
      else {
        obj['on' + eventName] = null;
      }
    };

    return {
      add: add,
      remove: remove
    }; // end of public (return statement)

  }());

  // Define the CellClass constructor
  var CellClass = function (props) {
    var me = this, i , j;
    me.ctrs = [];
    me.colspan = -1;
    me.rowspan = -1;
    me.style = -1;

    // Initialize our TableItemsClass properties
    for (var key in props) {
      me[key] = props[key];
    }
  };
  CellClass.prototype.getStyle = function () {
    var me = this;
    return me.style == -1 ? '' : me.style;
  };
  CellClass.prototype.setStyle = function (style) {
    var me = this;
    me.style = style;
  };
  CellClass.prototype.setRowSpan = function (rowspan) {
    var me = this;
    me.rowspan = rowspan;
  };
  CellClass.prototype.setColSpan = function (colspan) {
    var me = this;
    me.colspan = colspan;
  };
  CellClass.prototype.getControls = function () {
    var me = this;
    return me.ctrs;
  };
  CellClass.prototype.setControls = function (ctrs) {
    var me = this;
    me.ctrs = clone(ctrs);
  };
  CellClass.prototype.addControls = function (ctrs) {
    var me = this;
    for (var i = 0; i < ctrs.length; i++) {
      me.ctrs.push(ctrs[i]);
    }
  };
  CellClass.prototype.deleteControlWithRowIndex = function (rowIndex) {
    var me = this;

    me.ctrs.keySort(Controller.getObjectSortFromPosCol());
    var controlsTemp = TemplateList.getArrayControlFromColumn(me.ctrs, -1);
    $.each(controlsTemp, function () {
      controls.splice(controls.indexOfObject(this), 1);
    });
    controlsTemp.splice(me.ctrs.pos_row - 1, 1);

    for (var i = 0; i < controlsTemp.length; i++) {
      var item = controlsTemp[i];
      item.pos_row = i + 1;
    }
  };
  CellClass.prototype.deleteControl = function (ctr_id) {
    var me = this;
    var is_deleted = false;
    for (var i = 0; i < me.ctrs.length; i++) {
      if (is_deleted === true) {
        me.ctrs[i].pos_row -= 1;
        continue;
      }
      if (me.ctrs[i].control_id == ctr_id) {
        me.ctrs.splice(me.ctrs.indexOfObject(me.ctrs[i]), 1);
        is_deleted = true;
      }
    }
  };
  CellClass.prototype.clear = function () {
    var me = this;
    me.ctrs = new Array();
    me.rowspan = -1;
    me.colspan = -1;
    me.style = '';
  };

// Define the TableItemsClass constructor
  var GridClass = function (props) {
    var me = this, i , j;
    me.maxRow = 1;
    me.maxCol = 1;

    // Initialize our TableItemsClass properties
    for (var key in props) {
      me[key] = props[key];
    }

    if (!me.items) {
      me.items = {};
      // loop
      for (i = 0; i < me.maxRow; i++) {
        for (j = 0; j < me.maxCol; j++) {
          me.items["cell_" + i + "-" + j] = new CellClass({
            ctrs: [],
            colspan: -1,
            rowspan: -1
          });
        }
      }
    } else {
      // loop
      for (i = 0; i < me.maxRow; i++) {
        for (j = 0; j < me.maxCol; j++) {
          var cell = me.items["cell_" + i + "-" + j];
          if (cell) {
            var newCell = new CellClass({
              ctrs: cell.ctrs,
              colspan: cell.colspan,
              rowspan: cell.rowspan
            });
            cell = newCell;
          }
        }
      }
    }
  };
  GridClass.prototype.setItems = function (items) {
    var me = this;
    me.items = items;
  };
  GridClass.prototype.getItems = function () {
    var me = this;
    return me.items;
  };
  GridClass.prototype.getCell = function (rowIndex, colIndex) {
    var me = this;
    return me.items["cell_" + rowIndex + "-" + colIndex];
  };
  GridClass.prototype.createCell = function (rowIndex, colIndex, rowspan, colspan, ctrs) {
    var me = this;
    me.items["cell_" + rowIndex + "-" + colIndex] = new CellClass({rowspan: rowspan, colspan: colspan, ctrs: ctrs});
  };
  GridClass.prototype.getCellFromKey = function (cellKey) {
    var me = this;
    return me.items[cellKey];
  };
  GridClass.prototype.deleteCellFromKey = function (cellKey) {
    var me = this;
    delete me.items[cellKey];
  };
  GridClass.prototype.deleteCell = function (rowIndex, colIndex) {
    var me = this;
    var cell = me.items["cell_" + rowIndex + "-" + colIndex];
    if (cell) {
      var ctrs = clone(cell.getControls());
      delete me.items["cell_" + rowIndex + "-" + colIndex];
      return ctrs;
    }
  };

  GridClass.prototype.updateCellFromKey = function (cellKey, obj) {
    var me = this;
    var cell = me.getCellFromKey(cellKey);
    if (cell !== undefined) {
      if (typeof obj.rowspan != 'undefined') {
        cell.setRowSpan(obj.rowspan);
      }
      if (typeof obj.colspan != 'undefined') {
        cell.setColSpan(obj.colspan);
      }
      if (typeof obj.ctrs != 'undefined') {
        cell.addControls(obj.ctrs);
      }
      if (typeof obj.style != 'undefined') {
        cell.setStyle(obj.style);
      }
      return true;
    }
    return false;
  };
  GridClass.prototype.updateCell = function (rowIndex, colIndex, obj) {
    var me = this;
    var cell = me.getCell(rowIndex, colIndex);
    if (cell !== undefined) {
      if (typeof obj.rowspan != 'undefined') {
        cell.setRowSpan(obj.rowspan);
      }
      if (typeof obj.colspan != 'undefined') {
        cell.setColSpan(obj.colspan);
      }
      if (typeof obj.ctrs != 'undefined') {
        var ctrsCell = cell.getControls();
        // ctrsCell.keySort(Controller.getObjectSortFromPosCol());
        for (var i = 0; i < obj.ctrs.length; i++) {
          obj.ctrs[i].pos_row = ctrsCell.length + i + 1;
        }
        cell.addControls(obj.ctrs);

      }
      if (typeof obj.style != 'undefined') {
        cell.setStyle(obj.style);

      }
      return true;
    }
    return false;
  };
// arrObject: array[{object}]
// {object} prop: rowIndex, cellIndex
  GridClass.prototype.getMultiCell = function (arrObject) {
    var me = this, results = [];
    for (var i = 0; i < arrObject.length; i++) {
      results.push(me.getCell(arrObject[i].rowIndex, arrObject[i].cellIndex));
    }
    return results;
  };

  Controller = {
    //button, checkbox, color, date , datetime , datetime-local , email , file, hidden, image
    //, month , number , password, radio, range , reset, search
    //, submit, tel, text, time , url, week
    MapType: {
      text: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/ui-text-input-icon.png',
        tag: 'input',
        type: 'text',
        label: MyLang.getMsg("HTML_TEXT_BOX"),
        config: {
          attributes: {
            lblname: '',
            showlblname: true,
            widthlbl: '100px',
            style: 'width:100%',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            new_attrs: ''
          },
          settingfields: {
            lblname: true,
            showlblname: true,
            widthlbl: true,
            beforecontent: true,
            aftercontent: true,
            name: true,
            style: true,
            class: true,
            new_attrs: true,
            value: true,
            maxlength: true,
            disabled: true,
            readOnly: true,
            placeholder: true
          }
        }
      },
      textarea: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/ui-text-area-icon.png',
        tag: 'textarea',
        label: MyLang.getMsg("HTML_TEXT_AREA"),
        type: null,
        config: {
          attributes: {
            lblname: '',
            widthlbl: '100px',
            showlblname: true,
            style: 'width:100%',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            new_attrs: ''
          },
          settingfields: {
            lblname: true,
            widthlbl: true,
            showlblname: true,
            beforecontent: true,
            aftercontent: true,
            name: true,
            style: true,
            class: true,
            new_attrs: true,
            value: true,
            cols: true,
            rows: true,
            disabled: true,
            readOnly: true
          }
        }
      },
      label: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/ui_text_label.png',
        tag: 'label',
        label: MyLang.getMsg("HTML_TEXT_LABEL"),
        config: {
          attributes: {
            lblname: '',
            class: 'detail_name',
            showlblname: false,
            style: '',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            new_attrs: ''
          },
          settingfields: {
            lblname: true,
            showlblname: false,
            beforecontent: false,
            aftercontent: false,
            name: false,
            style: true,
            class: true,
            new_attrs: false,
            value: false,
            maxlength: false,
            disabled: false,
            readOnly: false,
            placeholder: true
          }
        }
      },
      serial_number: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/serial-numbers-icon.png',
        tag: 'serial_number',
        label: MyLang.getMsg("HTML_TEXT_SERIAL_LABEL"),
        config: {
          attributes: {
          },
          settingfields: {

          }
        }
      },
      date: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/date.png',
        tag: 'input',
        type: 'text',
        label: MyLang.getMsg("HTML_INPUT_DATE"),
        config: {
          attributes: {
            lblname: '',
            widthlbl: '100px',
            showlblname: true,
            style: 'width:100%',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            new_attrs: '',
            class: 'date'
          },
          settingfields: {
            lblname: true,
            widthlbl: true,
            showlblname: true,
            beforecontent: true,
            aftercontent: true,
            name: true,
            style: true,
            class: true,
            new_attrs: true,
            value: true,
            maxlength: true,
            disabled: true,
            readOnly: true,
            placeholder: true
          }
        }
      },
      time: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/time.png',
        tag: 'input',
        type: 'time',
        label: MyLang.getMsg('HTML_INPUT_TIME'),
        config: {
          attributes: {
            lblname: '',
            widthlbl: '100px',
            showlblname: true,
            style: 'width:100%',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            new_attrs: '',
            class: 'time'
          },
          settingfields: {
            lblname: true,
            widthlbl: true,
            showlblname: true,
            beforecontent: true,
            aftercontent: true,
            name: true,
            style: true,
            class: true,
            new_attrs: true,
            value: true,
            maxlength: false,
            disabled: true,
            readOnly: true,
            placeholder: true
          }
        }
      },
      color: {
        show: false,
        iconUrl: BASE_URL + '/images/icon_ctr/color_wheel.png',
        tag: 'input',
        type: 'color',
        label: MyLang.getMsg('HTML_INPUT_COLOR'),
        config: {
          attributes: {
            lblname: '',
            widthlbl: '100px',
            showlblname: true,
            style: 'width:100%',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            new_attrs: ''
          },
          settingfields: {
            lblname: true,
            widthlbl: true,
            showlblname: true,
            beforecontent: true,
            aftercontent: true,
            name: true,
            style: true,
            class: true,
            new_attrs: true,
            value: true,
            maxlength: true,
            disabled: true,
            readOnly: true,
            placeholder: true
          }
        }
      },
      email: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/mail.png',
        tag: 'input',
        type: 'email',
        label: MyLang.getMsg('HTML_INPUT_MAIL_ADDRESS'),
        config: {
          attributes: {
            lblname: '',
            widthlbl: '100px',
            showlblname: true,
            style: 'width:100%',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            new_attrs: ''
          },
          settingfields: {
            lblname: true,
            widthlbl: true,
            showlblname: true,
            beforecontent: true,
            aftercontent: true,
            name: true,
            style: true,
            class: true,
            new_attrs: true,
            value: true,
            maxlength: true,
            disabled: true,
            readOnly: true,
            placeholder: true
          }
        }
      },
      file: {
        show: false,
        iconUrl: BASE_URL + '/images/icon_ctr/attach.png',
        tag: 'input',
        type: 'file',
        label: MyLang.getMsg("HTML_INPUT_UPLOAD_FILE"),
        config: {
          attributes: {
            lblname: '',
            widthlbl: '100px',
            showlblname: true,
            style: 'width:100%',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            new_attrs: ''
          },
          settingfields: {
            lblname: true,
            widthlbl: true,
            showlblname: true,
            beforecontent: true,
            aftercontent: true,
            name: true,
            style: true,
            class: true,
            new_attrs: true,
            value: true,
            maxlength: true,
            disabled: true,
            readOnly: true,
            placeholder: true
          }
        }
      },
      button: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/ui_button.png',
        tag: 'input',
        type: 'button',
        label: MyLang.getMsg("HTML_INPUT_BUTTON"),
        config: {
          attributes: {
            lblname: '',
            widthlbl: '100px',
            showlblname: true,
            style: 'width:100%',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            new_attrs: ''
          },
          settingfields: {
            lblname: true,
            widthlbl: true,
            showlblname: true,
            beforecontent: false,
            aftercontent: false,
            name: true,
            style: true,
            class: true,
            new_attrs: true,
            value: true,
            maxlength: false,
            disabled: true,
            readOnly: true,
            placeholder: true
          }
        }
      },
      submit: {
        show: false,
        iconUrl: BASE_URL + '/images/icon_ctr/form_input_button_ok.png',
        tag: 'input',
        type: 'submit',
        label: MyLang.getMsg("HTML_INPUT_BUTTON_SUBMIT"),
        config: {
          attributes: {
            lblname: '',
            widthlbl: '100px',
            showlblname: true,
            style: 'width:100%',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            new_attrs: ''
          },
          settingfields: {
            lblname: true,
            widthlbl: true,
            showlblname: true,
            beforecontent: true,
            aftercontent: true,
            name: true,
            style: true,
            class: true,
            new_attrs: true,
            value: true,
            maxlength: true,
            disabled: true,
            readOnly: true,
            placeholder: true
          }
        }
      },
      select: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/ui_combo_box_edit.png',
        tag: 'select',
        type: null,
        label: MyLang.getMsg("HTML_INPUT_PULLDOWN"),
        config: {
          items: [],
          attributes: {
            lblname: '',
            widthlbl: '100px',
            showlblname: true,
            style: 'width:100%',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            new_attrs: ''
          },
          settingfields: {
            lblname: true,
            widthlbl: true,
            showlblname: true,
            beforecontent: true,
            aftercontent: true,
            name: true,
            style: true,
            class: true,
            new_attrs: true,
            multiple: true,
            value: true,
            selectedIndex: true,
            items: true,
            disabled: true
          }
        }
      },
      checkbox: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/checkbox_checked.png',
        tag: 'input',
        type: 'checkbox',
        label: MyLang.getMsg("HTML_INPUT_CHECKBOX"),
        config: {
          attributes: {
            lblname: '',
            widthlbl: '100px',
            showlblname: true,
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            new_attrs: ''
          },
          settingfields: {
            lblname: true,
            widthlbl: true,
            showlblname: true,
            beforecontent: true,
            aftercontent: true,
            name: true,
            style: true,
            class: true,
            new_attrs: true,
            checked: true,
            disabled: true,
            value: true
          }
        }
      },
      checkboxgroup: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/group_input_checkbox.png',
        tag: 'div',
        label: MyLang.getMsg("HTML_INPUT_CHECKBOX_GROUP"),
        config: {
          items: [],
          attributes: {
            name: '',
            lblname: '',
            widthlbl: '100px',
            showlblname: true,
            style: '',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            rbgdirection: 'horizontal'
          },
          settingfields: {
            lblname: true,
            widthlbl: true,
            showlblname: true,
            beforecontent: true,
            aftercontent: true,
            name: true,
            style: true,
            rbgdirection: true,
            rbgitems: true
          }
        }
      },
      radio: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/radio-button-on-icon.png',
        tag: 'input',
        type: 'radio',
        label: MyLang.getMsg("HTML_INPUT_RADIO"),
        config: {
          attributes: {
            lblname: '',
            widthlbl: '100px',
            showlblname: true,
            style: '',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            new_attrs: ''
          },
          settingfields: {
            lblname: true,
            widthlbl: true,
            showlblname: true,
            beforecontent: true,
            aftercontent: true,
            name: true,
            style: true,
            class: true,
            new_attrs: true,
            checked: true,
            disabled: true,
            value: true
          }
        }
      },
      radiogroup: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/group_input_radio.png',
        tag: 'div',
        label: MyLang.getMsg("HTML_INPUT_RADIO_GROUP"),
        config: {
          items: [],
          attributes: {
            name: '',
            lblname: '',
            widthlbl: '100px',
            showlblname: true,
            style: '',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            rbgdirection: 'horizontal'
          },
          settingfields: {
            lblname: true,
            widthlbl: true,
            showlblname: true,
            beforecontent: true,
            aftercontent: true,
            name: true,
            style: true,
            rbgdirection: true,
            rbgitems: true
          }
        }
      },
      boxgroup: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/ui-group-box-icon.png',
        tag: 'div',
        label: MyLang.getMsg("HTML_INPUT_GROUP"),
        config: {
          items: [],
          attributes: {
            name: '',
            lblname: '',
            widthlbl: '100px',
            showlblname: true,
            style: '',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            bgdirection: 'horizontal'
          },
          settingfields: {
            lblname: true,
            widthlbl: true,
            showlblname: true,
            beforecontent: true,
            aftercontent: true,
            class: true,
            new_attrs: true,
            name: true,
            style: true,
            bgdirection: true,
            bgitems: true
          }
        }
      },
      box: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/html_input_box.png',
        tag: 'div',
        label: MyLang.getMsg("HTML_INPUT_BOX"),
        config: {
          html: '',
          attributes: {
            name: '',
            lblname: '',
            widthlbl: '100px',
            showlblname: true,
            style: '',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            new_attrs: ''
          },
          settingfields: {
            lblname: true,
            widthlbl: true,
            showlblname: true,
            //beforecontent: true,
            //aftercontent: true,
            name: true,
            style: false,
            class: false,
            new_attrs: false,
            html: true
          }
        }
      },
      hidden: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/ui_label_field.png',
        tag: 'input',
        type: 'hidden',
        label: MyLang.getMsg("HTML_INPUT_HIDDEN"),
        config: {
          attributes: {
            lblname: '',
            widthlbl: '',
            showlblname: false,
            style: 'width:100%',
            new_attrs: ''
          },
          settingfields: {
            lblname: true,
            widthlbl: false,
            showlblname: false,
            beforecontent: false,
            aftercontent: false,
            name: true,
            style: false,
            class: true,
            new_attrs: true,
            value: true,
            maxlength: false,
            disabled: false,
            readOnly: false,
            placeholder: false
          }
        }
      },
      grid: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/grid.png',
        tag: 'div',
        label: 'Grid（グリッド）',
        config: {
          items: [],
          attributes: {
            style: 'width:100%',
            class: '',
            max_col: 1,
            max_row: 1,
            new_attrs: 'cellspacing="0" cellpadding="0"'
          },
          settingfields: {
            name: true,
            style: true,
            class: true,
            new_attrs: true,
            max_col: true,
            max_row: true
          }
        }
      },
      canvas: {
        show: true,
        iconUrl: BASE_URL + '/images/icon_ctr/ui-canvas-icon.png',
        tag: 'canvas',
        type: 'canvas',
        label: MyLang.getMsg("HTML_CANVAS"),
        config: {
          attributes: {
            lblname: '',
            showlblname: true,
            widthlbl: '100px',
            style: 'border:solid 1px silver; float:left;',
            beforecontent: '',
            beforecontentcolor: '#000000',
            beforecontentbold: 'normal',
            aftercontent: '',
            aftercontentcolor: '#000000',
            aftercontentbold: 'normal',
            new_attrs: 'width="72" height="72"'
          },
          settingfields: {
            lblname: true,
            showlblname: true,
            widthlbl: true,
            beforecontent: true,
            aftercontent: true,
            name: true,
            style: true,
            class: true,
            new_attrs: true,
            value: false,
            maxlength: false,
            disabled: true,
            readOnly: false,
            placeholder: false
          }
        }
      }
    },
    clean: function (elm) {
      var removeAttrs = [
        'lblname',
        'widthlbl',
        'showlblname',
        'beforecontent',
        'beforecontentcolor',
        'beforecontentbold',
        'aftercontent',
        'aftercontentcolor',
        'aftercontentbold',
        'new_attrs',
        'rbgdirection',
        'bgdirection'
      ];
      var cleanAttrs = [
        'name',
        'style',
        'class',
        'maxlength',
        //'value',
        'cols',
        'rows',
        'placeholder'
      ];

      var callCleanChild = function (aElm) {
        $.each($(aElm).children(), function () {
          var child = this;

          $.each(cleanAttrs, function () {
            if ($(child).attr(this) != undefined && $(child).attr(this).trim() == '') {
              $(child).removeAttr(this);
            }
          });

          $.each(removeAttrs, function () {
            $(child).removeAttr(this);
          });
          if ($(child).children().length > 0) {
            callCleanChild(child)
          }
        });
      };

      $.each(cleanAttrs, function () {
        if ($(elm).attr(this) != undefined && $(elm).attr(this).trim() == '') {
          $(elm).removeAttr(this);
        }
      });

      $.each(removeAttrs, function () {
        $(elm).removeAttr(this);
      });

      //clean all child
      callCleanChild(elm);

      return elm;
    },
    addNewAttrs: function (aElm, str_attrs) {
      str_attrs = str_attrs.replace(/\\\"/g, '"');
      str_attrs = unescapeAndDecodeHtml(str_attrs);
      try {
        var str_Result = '';
        // check is json_old
        if (str_attrs.toString().trim() != "" && str_attrs.toString().search('"') > -1) {
          // is new json
          var html = '<span ' + str_attrs + '></span>';
          var newElm = document.createElement('div');
          $(newElm).append(html);
          var span = $(newElm).children()[0];
//          for (var i = 0; i < span.attributes.length; i++) {
//            var att = span.attributes[i];
//            $(aElm).attr(att.nodeName, getValFromNodeAttribute(att));
//            str_Result += att.nodeName + '="' + getValFromNodeAttribute(att) + '" ';
//          }

          $.each(span.attributes, function() {
            if(this.value !== '') {
              $(aElm).attr(this.name, this.value);
              str_Result.result += ' ' + this.name + '="' + this.value + '"';
            }else{
              $(aElm).attr(this.name, '');
              str_Result.result += ' ' + this.name;
              RenderLayout.addSpecialAttrs(this.name);
            }
          });
          // return str_Result.trim().replace(/"/g,"\\\"");
          return escapeAndEncodeHtml(str_Result.trim());
        } else {
          var arrAttrs;
          str_attrs = str_attrs.toString().trim().replace(/\"/g, "");
          if(str_attrs.search('=') > -1){
            arrAttrs = str_attrs.split(';');
            for (var i = 0; i < arrAttrs.length; i++) {
              var arrAtt = arrAttrs[i].split('=');
              if (arrAtt[0] && arrAtt[1]) {
                $(aElm).attr(arrAtt[0].trim(), arrAtt[1]);
                str_Result += arrAtt[0].trim() + '="' + arrAtt[1] + '" ';
              }
            }
          }else {
            arrAttrs = str_attrs.split(' ');
            $.each(arrAttrs, function(){
              $(aElm).attr(this.toString(), '');
              str_Result += this.toString() + ' ';
              RenderLayout.addSpecialAttrs(this.toString());
            });
          }
          // return str_Result.trim().replace(/"/g,"\\\"");
          return escapeAndEncodeHtml(str_Result.trim());
        }

      } catch (e) {
        //console.log(e)
        // return str_Result.trim().replace(/"/g,"\\\"");
        return escapeAndEncodeHtml(str_attrs);
      }

    },
    isMarkMandatory: function(aControl){
      var result = false;
      if(typeof aControl.config.items != 'undefined'){
        if(aControl.map_type_control === 'boxgroup'){
          var tmp = [];
          var name = null;
          $.each(aControl.config.items, function () {
            var ctr = this;
            if (typeof ctr.config != 'undefined'
              && typeof ctr.config.attributes != 'undefined'
              && typeof ctr.config.attributes.name != 'undefined'
              && ctr.config.attributes.name != '') {
              var is_mandatory = false;
              if(typeof ctr.config.attributes.class != 'undefined' && ctr.config.attributes.class.search('mandatory') > -1){
                is_mandatory = true;
              }
              tmp.push({name:ctr.config.attributes.name, is_mandatory:is_mandatory});
              name = ctr.config.attributes.name;
            }
          });
          if(name){
            result = true;
            $.each(tmp,function(){
              if(this.name.toString() != name || !this.is_mandatory){
                result = false;
                return false;
              }
            });
            return result;
          }
        }else {
          $.each(aControl.config.items, function () {
            var ctr = this;
            if (typeof ctr.config != 'undefined'
              && typeof ctr.config.attributes != 'undefined'
              && typeof ctr.config.attributes.class != 'undefined'
              && ctr.config.attributes.class.search('mandatory') > -1) {
              result = true;
              return false;
            }
          });
        }
      }
      return result;
    },
    create: function (aControl, isRender, aIsMarkMandatory) {
      if(typeof aIsMarkMandatory == 'undefined'){
        aIsMarkMandatory = false;
      }
      if (typeof Controller.MapType[aControl.map_type_control] == 'undefined' || typeof Controller.MapType[aControl.map_type_control].tag == 'undefined') {
        var elm = document.createElement('div');
        aControl.map_type_control = 'text';
        aControl.config = new Object();
        aControl.config.attributes = new Object();
        aControl.config.attributes.name = MyLang.getMsg('HTML_NOT_SUPPORT_TAG');
        aControl.config.attributes.lblname = MyLang.getMsg('HTML_NOT_SUPPORT_TAG');
        aControl.config.attributes.class = "no_support";
        aControl.config.attributes.value = MyLang.getMsg('HTML_NOT_SUPPORT_TAG');

        aControl.config.config = new Object();

        return Controller.create(aControl, isRender, aIsMarkMandatory);
      }
      var newControl = clone(Controller.MapType[aControl.map_type_control]);

			var elm = document.createElement(newControl.tag);
			if (typeof(newControl.type) !== 'undefined' && newControl.type != null) {
			  //elm.type = newControl.type;
			  elm.setAttribute('type', newControl.type);
			}

      if (newControl.config) {
        var cfg = newControl.config;
        if (cfg.attributes) {
          for (var att in cfg.attributes) {
            elm.setAttribute(att, cfg.attributes[att]);
          }
          if (cfg.attributes.new_attrs) {
            cfg.attributes.new_attrs = Controller.addNewAttrs(elm, cfg.attributes.new_attrs);
          }
        }
      }

      if (typeof aControl.config != 'undefined') {
        if (aControl.config.attributes) {
          for (var att in aControl.config.attributes) {
            if (aControl.map_type_control == 'textarea' && att == 'value') {
              elm.setAttribute(att, unescapeAndDecodeHtml(aControl.config.attributes[att]));
            } else {
              elm.setAttribute(att, aControl.config.attributes[att]);
            }
          }
          if (aControl.config.attributes.new_attrs) {
            cfg.attributes.new_attrs = Controller.addNewAttrs(elm, aControl.config.attributes.new_attrs);
          }
        }
        if (aControl.map_type_control == 'select') {
          if (typeof aControl.config != 'undefined' && typeof aControl.config.items != 'undefined' && aControl.config.items) {
            for (var i = 0; i < aControl.config.items.length; i++) {
              var item = aControl.config.items[i];
              var option = new Option();
              option.text = item.text;
              option.value = item.value;
							if(aControl.config.attributes.value != "" && aControl.config.attributes.value == item.value){
								option.setAttribute('selected', 'selected');
							}
              elm.options.add(option);
            }
          }
        }
      }

      if (elm.tagName == 'TEXTAREA') {
        if ($(elm).attr('class') != undefined && $(elm).attr('class').search('richtext') > -1) {
          if (aControl.config.attributes.style != undefined) {
            var style = aControl.config.attributes.style;
            var index = style.search('width');
            if (index > -1) {
              var style_split = style.split(';');
              for (var i = 0; i < style_split.length; i++) {
                var splitTmp = style_split[i].split(':');
                if (splitTmp.length == 2 && splitTmp[0] == 'width') {
                  if (splitTmp[1].trim() == '') {
                    elm.style.width = '0px';
                    break;
                  }
                }
              }
            } else {
              if (style[style.length - 1] == ';') {
                style = style.substring(0, style.length - 1);
              }
              style += ';width:0px';
              elm.style.width = '0px';
            }
          } else {
            aControl.config.attributes.style = 'width:0px';
            elm.style.width = '0px';
          }
        }
      }

      if (aControl.map_type_control == 'radiogroup') {
        if (typeof aControl.config.attributes.rbgdirection == 'undefined') {
          aControl.config.attributes.rbgdirection = 'horizontal';
        }
        var isMarkMandatory = Controller.isMarkMandatory(aControl);
        for (var i = 0; i < aControl.config.items.length; i++) {
          var itemCtr = Controller.create(aControl.config.items[i], isRender, isMarkMandatory);
          //var vHtml = '<label>';
          var vHtml = '';
          vHtml += itemCtr.outerHTML;
          var lbl = ''
          if (Controller.getShowLabelName(itemCtr) == false) {

          } else {
            lbl = Controller.getLabelName(itemCtr)
          }
          if ($(itemCtr).attr('class') != undefined && $(itemCtr).attr('class').search('mandatory') > -1 && !isMarkMandatory) {
            lbl += '&nbsp;<font color="red">*</font>';
          }
          vHtml += lbl.trim() != '' ? '<span>' + lbl + '</span>' : lbl;
          //vHtml += '</label>';
          if (aControl.config.attributes.rbgdirection != 'horizontal') {
            vHtml += '<br>';
          }
          $(elm).append(vHtml);
        }
      }

      if (aControl.map_type_control == 'checkboxgroup') {
        if (typeof aControl.config.attributes.rbgdirection == 'undefined') {
          aControl.config.attributes.rbgdirection = 'horizontal';
        }
        var isMarkMandatory = Controller.isMarkMandatory(aControl);
        for (var i = 0; i < aControl.config.items.length; i++) {
          var itemCtr = Controller.create(aControl.config.items[i], isRender, isMarkMandatory);
          //var vHtml = '<label>';
          var vHtml = '';
          vHtml += itemCtr.outerHTML;
          var lbl = ''
          if (Controller.getShowLabelName(itemCtr) == false) {

          } else {
            lbl = Controller.getLabelName(itemCtr)
          }
          if ($(itemCtr).attr('class') != undefined && $(itemCtr).attr('class').search('mandatory') > -1 && !isMarkMandatory) {
            lbl += '&nbsp;<font color="red">*</font>';
          }
          vHtml += lbl.trim() != '' ? '<span>' + lbl + '</span>' : lbl;
          //vHtml += '</label>';
          if (aControl.config.attributes.rbgdirection != 'horizontal') {
            vHtml += '<br>';
          }
          $(elm).append(vHtml);
        }
      }

      if (aControl.map_type_control == 'boxgroup') {

        var isMarkMandatory = Controller.isMarkMandatory(aControl);
        var vHtml = '';
        if (typeof aControl.config.attributes.bgdirection == 'undefined') {
          aControl.config.attributes.bgdirection = 'horizontal';
        }
        if (aControl.config.attributes.bgdirection == 'horizontal') {
          // horizontal
          vHtml += '<table style="width: 100%;" cellspacing="0" cellpadding="0"><tr>';
          for (var i = 0; i < aControl.config.items.length; i++) {
            var itemCtr = Controller.create(aControl.config.items[i], false, isMarkMandatory);
            if (aControl.config.items[i].map_type_control != 'label'
              && aControl.config.items[i].config.attributes.showlblname.toString() == 'true'
              ) {
              vHtml += '<td class="' + aControl.config.items[i].config.attributes.class + '">';
            } else {
              vHtml += '<td>';
            }

            if (aControl.config.items[i].map_type_control == 'label') {
              $(itemCtr).text(aControl.config.items[i].config.attributes.lblname);
              var newElm = document.createElement('div');
              $(newElm).attr('style', $(itemCtr).attr('style'));
              newElm.className = itemCtr.className;
              Controller.clean(itemCtr);
              itemCtr.className = '';
              $(newElm).append(itemCtr);

              vHtml += newElm.outerHTML;
            } else {
              var lbl = '';
              if (Controller.getShowLabelName(itemCtr) == false) {

              } else {
                lbl = Controller.getLabelName(itemCtr)
              }
              if(isMarkMandatory){

              }else if ($(itemCtr).attr('class') != undefined && $(itemCtr).attr('class').search('mandatory') > -1) {
                lbl += '&nbsp;<font color="red">*</font>';
              }
              vHtml += lbl.trim() != '' ? '<span>' + lbl + '</span>' : lbl;
              vHtml += '</td><td>';
              if (aControl.config.items[i].map_type_control == 'textarea') {
                $(itemCtr).text(unescapeAndDecodeHtml($(itemCtr).attr('value')));
                $(itemCtr).removeAttr('value');
              }
              var box = document.createElement('label');
              if (itemCtr.hasAttribute('beforecontent')) {
                var color = Controller.getValueFromAttrName(itemCtr, 'beforecontentcolor');
                var bold = Controller.getValueFromAttrName(itemCtr, 'beforecontentbold');
                if (itemCtr.getAttribute('beforecontent').trim() != '') {
                  $(box).append('<span style="color:' + color + ';font-weight:' + bold + '">' + itemCtr.getAttribute('beforecontent') + '</span>');
                }
              }
              $(box).append(itemCtr);
              if (itemCtr.hasAttribute('aftercontent')) {
                var color = Controller.getValueFromAttrName(itemCtr, 'aftercontentcolor');
                var bold = Controller.getValueFromAttrName(itemCtr, 'aftercontentbold');
                if (itemCtr.getAttribute('aftercontent').trim() != '') {
                  $(box).append('<span style="color:' + color + ';font-weight:' + bold + '">' + itemCtr.getAttribute('aftercontent') + '</span>');
                }
              }
              //vHtml += box.outerHTML;
              vHtml += box.innerHTML;

            }
            vHtml += '</td>';
          }
          vHtml += '</tr></table>';
        } else {
          // vertical
          for (var i = 0; i < aControl.config.items.length; i++) {
            vHtml += '<table style="width: 100%;" cellspacing="0" cellpadding="0"><tr>';
            var itemCtr = Controller.create(aControl.config.items[i], false, isMarkMandatory);
            if (aControl.config.items[i].map_type_control != 'label'
              && aControl.config.items[i].config.attributes.showlblname.toString() == 'true'
              ) {
              vHtml += '<td class="' + aControl.config.items[i].config.attributes.class + '">';
            } else {
              vHtml += '<td>';
            }

            if (aControl.config.items[i].map_type_control == 'label') {
              $(itemCtr).text(aControl.config.items[i].config.attributes.lblname);
              var newElm = document.createElement('div');
              $(newElm).attr('style', $(itemCtr).attr('style'));
              newElm.className = itemCtr.className;
              Controller.clean(itemCtr);
              itemCtr.className = '';
              $(newElm).append(itemCtr);

              vHtml += newElm.outerHTML;
            } else {
              var lbl = '';
              if (Controller.getShowLabelName(itemCtr) == false) {

              } else {
                lbl = Controller.getLabelName(itemCtr)
              }

              if(isMarkMandatory){

              }else if ($(itemCtr).attr('class') != undefined && $(itemCtr).attr('class').search('mandatory') > -1) {
                lbl += '&nbsp;<font color="red">*</font>';
              }
              vHtml += lbl.trim() != '' ? '<span>' + lbl + '</span>' : lbl;
              vHtml += '</td><td>';
              if (aControl.config.items[i].map_type_control == 'textarea') {
                $(itemCtr).text(unescapeAndDecodeHtml($(itemCtr).attr('value')));
                $(itemCtr).removeAttr('value');
              }
              var box = document.createElement('label');
              if (itemCtr.hasAttribute('beforecontent')) {
                var color = Controller.getValueFromAttrName(itemCtr, 'beforecontentcolor');
                var bold = Controller.getValueFromAttrName(itemCtr, 'beforecontentbold');
                if (itemCtr.getAttribute('beforecontent').trim() != '') {
                  $(box).append('<span style="color:' + color + ';font-weight:' + bold + '">' + itemCtr.getAttribute('beforecontent') + '</span>');
                }
              }
              $(box).append(itemCtr);
              if (itemCtr.hasAttribute('aftercontent')) {
                var color = Controller.getValueFromAttrName(itemCtr, 'aftercontentcolor');
                var bold = Controller.getValueFromAttrName(itemCtr, 'aftercontentbold');
                if (itemCtr.getAttribute('aftercontent').trim() != '') {
                  $(box).append('<span style="color:' + color + ';font-weight:' + bold + '">' + itemCtr.getAttribute('aftercontent') + '</span>');
                }
              }
              //vHtml += box.outerHTML;
              vHtml += box.innerHTML;

            }
            vHtml += '</td>';
            vHtml += '</tr></table>';
          }
        }
        $(elm).append(vHtml);
      }

      if (typeof isRender == 'undefined') {
        isRender = false;
      }
      if (isRender == false) {
        return elm;
      } else {
        var box = document.createElement('label');
        if (aControl.map_type_control == 'label') {
          $(elm).text($(elm).attr('lblname'));
          $(elm).removeAttr('value');
          var newElm = document.createElement('div');
          $(newElm).attr('style', $(elm).attr('style'));
          newElm.className = elm.className;
          Controller.clean(elm);
          elm.className = '';
          $(newElm).append(elm);
          return newElm;
        }
        if (aControl.map_type_control == 'box') {
          $(elm).html(unescapeAndDecodeHtml(aControl.config.html));
          return elm;
        }


        if (elm.hasAttribute('lblname')) {
          var lbl = elm.getAttribute('lblname');
          if ($(elm).attr('class') != undefined && $(elm).attr('class').search('mandatory') > -1 && !aIsMarkMandatory) {
            lbl += '&nbsp;<font color="red">*</font>';
          }
          box.setAttribute('lblname', lbl)
        }
        if (elm.hasAttribute('widthlbl')) {
          box.setAttribute('widthlbl', elm.getAttribute('widthlbl'))
        }
        if (elm.hasAttribute('showlblname')) {
          box.setAttribute('showlblname', elm.getAttribute('showlblname'))
        }

        if (elm.hasAttribute('beforecontent')) {
          box.setAttribute('beforecontent', elm.getAttribute('beforecontent'));
          if (elm.hasAttribute('beforecontentcolor')) {
            box.setAttribute('beforecontentcolor', elm.getAttribute('beforecontentcolor'));
          }
          if (elm.hasAttribute('beforecontentbold')) {
            box.setAttribute('beforecontentbold', elm.getAttribute('beforecontentbold'));
          }
          var color = Controller.getValueFromAttrName(elm, 'beforecontentcolor');
          var bold = Controller.getValueFromAttrName(elm, 'beforecontentbold');
          if (elm.getAttribute('beforecontent').trim() != '') {
            $(box).append('<span style="color:' + color + ';font-weight:' + bold + '">' + elm.getAttribute('beforecontent') + '</span>');
          }
        }

        if (aControl.map_type_control == 'textarea') {
          $(elm).text($(elm).attr('value'));
          $(elm).removeAttr('value');
        }
        $(box).append(elm);

        if (elm.hasAttribute('aftercontent')) {
          box.setAttribute('aftercontent', elm.getAttribute('aftercontent'));
          if (elm.hasAttribute('aftercontentcolor')) {
            box.setAttribute('aftercontentcolor', elm.getAttribute('aftercontentcolor'));
          }
          if (elm.hasAttribute('aftercontentbold')) {
            box.setAttribute('aftercontentbold', elm.getAttribute('aftercontentbold'));
          }
          var color = Controller.getValueFromAttrName(elm, 'aftercontentcolor');
          var bold = Controller.getValueFromAttrName(elm, 'aftercontentbold');
          if (elm.getAttribute('aftercontent').trim() != '') {
            $(box).append('<span style="color:' + color + ';font-weight:' + bold + '">' + elm.getAttribute('aftercontent') + '</span>');
          }
        }

        return box;
      }
    },
    getLabelName: function (aElement) {

      if (aElement.hasAttribute('lblname')) {
        return $(aElement).attr('lblname');
      }
      return '';
    },
    getShowLabelName: function (aElement) {
      if (aElement.hasAttribute('showlblname')) {
        if ($(aElement).attr('showlblname') == 'true') {
          return true;
        }
      }
      return false;
    },
    getValueFromAttrName: function (aElement, aAttrName) {
      if (aElement.hasAttribute(aAttrName)) {
        if ($(aElement).attr(aAttrName) != 'undefined') {
          return $(aElement).attr(aAttrName);
        }
      }
      return '';
    }
  };
  Controller.getObjectSortFromPosCol = function () {
    return { pos_col: "asc", pos_row: "asc" };
  };
  Controller.moveControlOutGrid = function (items_grid_class, parentNodeOld, pos_row_old, controlsNew, parentNodeNew, pos_col_new, pos_row_new) {
    var cell_key = $(parentNodeOld).attr('cell_key');
    var cell = items_grid_class.getCellFromKey(cell_key);
    var ctrsInCell = cell.getControls();
    ctrsInCell.keySort(Controller.getObjectSortFromPosCol());

    var controlsTemp = TemplateList.getArrayControlFromColumn(ctrsInCell, -1);
    $.each(controlsTemp, function () {
      ctrsInCell.splice(ctrsInCell.indexOfObject(this), 1);
    });
    var itemSave = controlsTemp.splice(pos_row_old - 1, 1)[0];
    itemSave.pos_col = pos_col_new;
    // controlsTemp.splice(pos_row_new, 0, itemSave);
    // update control in pos_col_new
    var arrCtrsTmp = new Array();
    for (var i = 0; i < controlsTemp.length; i++) {
      var item = controlsTemp[i];
      item.pos_row = i + 1;
      arrCtrsTmp.push(item);
    }
    $.each(arrCtrsTmp, function () {
      $(parentNodeOld).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
    });
    ctrsInCell = ctrsInCell.concat(controlsTemp);
    cell.setControls(ctrsInCell);

    var controlsTemp = TemplateList.getArrayControlFromColumn(controlsNew, pos_col_new);
    $.each(controlsTemp, function () {
      controlsNew.splice(controlsNew.indexOfObject(this), 1);
    });
    controlsTemp.splice(pos_row_new, 0, itemSave);
    // update control in pos_col_new
    var arrCtrsTmp = new Array();
    for (var i = 0; i < controlsTemp.length; i++) {
      var item = controlsTemp[i];
      item.pos_row = i + 1;
      arrCtrsTmp.push(item);
    }
    $.each(arrCtrsTmp, function () {
      $(parentNodeNew).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
    });
    controlsNew = controlsNew.concat(controlsTemp);

    return controlsNew;
  };
  Controller.findGridNameByControl = function(elm){
    if(!elm){return null;}
    var parents = $(elm).parent('div[grideditor=true]');
    if(parents.length>0){
      return $(parent[0]).attr('name');
    }
    return null;
  };
  Controller.moveControlInGrid = function (items_grid_class, parentNodeOld, pos_row_old, parentNodeNew, pos_row_new, beforeCtrCellId) {

    if ($(parentNodeNew).attr('cell_key') === $(parentNodeOld).attr('cell_key')) {

      debugLog('*** case 1: move control in cell grid');
      var cell_key = $(parentNodeNew).attr('cell_key');
      var cell = items_grid_class.getCellFromKey(cell_key);
      var ctrsInCell = cell.getControls();
      ctrsInCell.keySort(Controller.getObjectSortFromPosCol());

      if (beforeCtrCellId) {
        var idx = 1;
        $.each(ctrsInCell, function () {
          if (this.control_id === beforeCtrCellId) {
            pos_row_new = idx;
            return false;
          }
          idx++
        });
      }
      var controlsTemp = TemplateList.getArrayControlFromColumn(ctrsInCell, -1);
      $.each(controlsTemp, function () {
        ctrsInCell.splice(ctrsInCell.indexOfObject(this), 1);
      });
      var itemSave = controlsTemp.splice(pos_row_old - 1, 1)[0];

      controlsTemp.splice(pos_row_new, 0, itemSave);

      // update control in pos_col_new
      var arrCtrsTmp = new Array();
      for (var i = 0; i < controlsTemp.length; i++) {
        var item = controlsTemp[i];
        item.pos_row = i + 1;
        arrCtrsTmp.push(item);
      }
      $.each(arrCtrsTmp, function () {
        $(parentNodeNew).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
      });
      ctrsInCell = ctrsInCell.concat(controlsTemp);
      cell.setControls(ctrsInCell);
    } else {

      debugLog('*** case 2: move control in other cell grid');

      var cell_key = $(parentNodeOld).attr('cell_key');
      var cell = items_grid_class.getCellFromKey(cell_key);
      var ctrsInCell = cell.getControls();
      ctrsInCell.keySort(Controller.getObjectSortFromPosCol());

      var controlsTemp = TemplateList.getArrayControlFromColumn(ctrsInCell, -1);
      $.each(controlsTemp, function () {
        ctrsInCell.splice(ctrsInCell.indexOfObject(this), 1);
      });
      var itemSave = controlsTemp.splice(pos_row_old - 1, 1)[0];
      // controlsTemp.splice(pos_row_new, 0, itemSave);
      // update control in pos_col_new
      var arrCtrsTmp = new Array();
      for (var i = 0; i < controlsTemp.length; i++) {
        var item = controlsTemp[i];
        item.pos_row = i + 1;
        arrCtrsTmp.push(item);
      }
      $.each(arrCtrsTmp, function () {
        $(parentNodeOld).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
      });
      ctrsInCell = ctrsInCell.concat(controlsTemp);
      cell.setControls(ctrsInCell);

      var cell_key = $(parentNodeNew).attr('cell_key');
      var cell = items_grid_class.getCellFromKey(cell_key);
      var ctrsInCell = cell.getControls();
      ctrsInCell.keySort(Controller.getObjectSortFromPosCol());

      var controlsTemp = TemplateList.getArrayControlFromColumn(ctrsInCell, -1);
      $.each(controlsTemp, function () {
        ctrsInCell.splice(ctrsInCell.indexOfObject(this), 1);
      });
      // var itemSave = controlsTemp.splice(pos_row_old - 1, 1)[0];
      controlsTemp.splice(pos_row_new, 0, itemSave);
      // update control in pos_col_new
      var arrCtrsTmp = new Array();
      for (var i = 0; i < controlsTemp.length; i++) {
        var item = controlsTemp[i];
        item.pos_row = i + 1;
        arrCtrsTmp.push(item);
      }
      $.each(arrCtrsTmp, function () {
        $(parentNodeNew).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
      });
      ctrsInCell = ctrsInCell.concat(controlsTemp);
      cell.setControls(ctrsInCell);
    }
    debugLog(items_grid_class);
  };
  Controller.moveControlToGrid = function (controlsOld, parentNodeOld, pos_col_old, pos_row_old, items_grid_class, parentNodeNew, pos_row_new) {
    controlsOld.keySort(Controller.getObjectSortFromPosCol());
    var controlsTemp = TemplateList.getArrayControlFromColumn(controlsOld, pos_col_old);
    $.each(controlsTemp, function () {
      controlsOld.splice(controlsOld.indexOfObject(this), 1);
    });
    var itemSave = controlsTemp.splice(pos_row_old - 1, 1)[0];
    itemSave.pos_col = -1;

    // update control in pos_col_old
    var arrCtrsTmp = new Array();
    for (var i = 0; i < controlsTemp.length; i++) {
      var item = controlsTemp[i];
      item.pos_row = i + 1;
      arrCtrsTmp.push(item);
    }
    $.each(arrCtrsTmp, function () {
      $(parentNodeOld).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
    });
    controlsOld = controlsOld.concat(controlsTemp);

    var cell_key = $(parentNodeNew).attr('cell_key');
    var cell = items_grid_class.getCellFromKey(cell_key);
    // cell.addControls([itemSave]);
    var ctrsInCell = cell.getControls();
    ctrsInCell.keySort(Controller.getObjectSortFromPosCol());

    var controlsTemp = TemplateList.getArrayControlFromColumn(ctrsInCell, -1);
    $.each(controlsTemp, function () {
      ctrsInCell.splice(ctrsInCell.indexOfObject(this), 1);
    });
    controlsTemp.splice(pos_row_new, 0, itemSave);
    // update control in pos_col_new
    var arrCtrsTmp = new Array();
    for (var i = 0; i < controlsTemp.length; i++) {
      var item = controlsTemp[i];
      item.pos_row = i + 1;
      arrCtrsTmp.push(item);
    }
    $.each(arrCtrsTmp, function () {
      $(parentNodeNew).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
      $(parentNodeNew).find('div[id="' + this.control_id + '"]').attr('section_id', $(parentNodeNew).attr('section_id'));
    });
    ctrsInCell = ctrsInCell.concat(controlsTemp);

    cell.setControls(ctrsInCell);
    return controlsOld;
  };
  Controller.moveCellControlToGrid = function (items_grid_class_old, parentNodeOld, pos_row_old, items_grid_class_new, parentNodeNew, pos_row_new) {
    var cell_key = $(parentNodeOld).attr('cell_key');

    var cell = items_grid_class_old.getCellFromKey(cell_key);
    // cell.addControls([itemSave]);
    var ctrsInCell = cell.getControls();
    ctrsInCell.keySort(Controller.getObjectSortFromPosCol());

    var controlsTemp = TemplateList.getArrayControlFromColumn(ctrsInCell, -1);
    $.each(controlsTemp, function () {
      ctrsInCell.splice(ctrsInCell.indexOfObject(this), 1);
    });
    var itemSave = controlsTemp.splice(pos_row_old - 1, 1)[0];
    itemSave.pos_col = -1;

    // update control in pos_col_old
    var arrCtrsTmp = new Array();
    for (var i = 0; i < controlsTemp.length; i++) {
      var item = controlsTemp[i];
      item.pos_row = i + 1;
      arrCtrsTmp.push(item);
    }
    $.each(arrCtrsTmp, function () {
      $(parentNodeOld).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
    });
    ctrsInCell = ctrsInCell.concat(controlsTemp);
    cell.setControls(ctrsInCell);

    var cell_key = $(parentNodeNew).attr('cell_key');
    var cell = items_grid_class_new.getCellFromKey(cell_key);
    // cell.addControls([itemSave]);
    var ctrsInCell = cell.getControls();
    ctrsInCell.keySort(Controller.getObjectSortFromPosCol());

    var controlsTemp = TemplateList.getArrayControlFromColumn(ctrsInCell, -1);
    $.each(controlsTemp, function () {
      ctrsInCell.splice(ctrsInCell.indexOfObject(this), 1);
    });
    controlsTemp.splice(pos_row_new, 0, itemSave);
    // update control in pos_col_new
    var arrCtrsTmp = new Array();
    for (var i = 0; i < controlsTemp.length; i++) {
      var item = controlsTemp[i];
      item.pos_row = i + 1;
      arrCtrsTmp.push(item);
    }
    $.each(arrCtrsTmp, function () {
      $(parentNodeNew).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
      $(parentNodeNew).find('div[id="' + this.control_id + '"]').attr('section_id', $(parentNodeNew).attr('section_id'));
    });
    ctrsInCell = ctrsInCell.concat(controlsTemp);
    cell.setControls(ctrsInCell);
  };

  Controller.changePosControlInControlsSamePosCol = function (controls, parentNode, pos_col, pos_row_old, pos_row_new) {

    controls.keySort(Controller.getObjectSortFromPosCol());

    var item = null;
    var controlsTemp = TemplateList.getArrayControlFromColumn(controls, pos_col);
    $.each(controlsTemp, function () {
      controls.splice(controls.indexOfObject(this), 1);
    });

    if (pos_row_old > pos_row_new) {
      // move up
      item = controlsTemp.splice(pos_row_old - 1, 1)[0];
      controlsTemp.splice(pos_row_new - 1, 0, item);
    } else {
      // move down
      item = controlsTemp.splice(pos_row_old - 1, 1)[0];
      controlsTemp.splice(pos_row_new - 1, 0, item);
    }

    // update row
    var arrCtrsTmp = new Array();

    for (var i = 0; i < controlsTemp.length; i++) {
      item = controlsTemp[i];
      item.pos_row = i + 1;
      arrCtrsTmp.push(item);
    }
    $.each(arrCtrsTmp, function () {
      $(parentNode).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
    });
    controls = controls.concat(controlsTemp);
    return controls;
  };
  Controller.changePosControlInControlsNotSamePosCol = function (controls, parentNodeOld, pos_col_old, pos_row_old, parentNodeNew, pos_col_new, pos_row_new) {
    controls.keySort(Controller.getObjectSortFromPosCol());
    var controlsTemp = TemplateList.getArrayControlFromColumn(controls, pos_col_old);
    var itemSave = controlsTemp.splice(pos_row_old - 1, 1)[0];
    itemSave = controls.splice(controls.indexOfObject(itemSave), 1)[0];
    itemSave.pos_col = pos_col_new;
    // update control in pos_col_old
    var arrCtrsTmp = new Array();
    for (var i = 0; i < controlsTemp.length; i++) {
      var item = controlsTemp[i];
      item.pos_row = i + 1;
      arrCtrsTmp.push(item);
    }
    $.each(arrCtrsTmp, function () {
      $(parentNodeOld).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
    });

    //controls.keySort(Controller.getObjectSortFromPosCol(pos_col_new));
    var controlsTemp = TemplateList.getArrayControlFromColumn(controls, pos_col_new);
    $.each(controlsTemp, function () {
      controls.splice(controls.indexOfObject(this), 1);
    });
    controlsTemp.splice(pos_row_new, 0, itemSave);
    // update control in pos_col_new
    var arrCtrsTmp = new Array();
    for (var i = 0; i < controlsTemp.length; i++) {
      var item = controlsTemp[i];
      item.pos_row = i + 1;
      item.pos_col = pos_col_new;
      arrCtrsTmp.push(item);
    }
    //$.each(controls, function(){console.log('['+this.control_id+']['+this.pos_col+']['+this.pos_row+']')})
    $.each(arrCtrsTmp, function () {
      $(parentNodeNew).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
    });
    controls = controls.concat(controlsTemp);
    return controls;
  };
  Controller.moveControlToOrtherSection = function (controlsOld, parentNodeOld, pos_col_old, pos_row_old, controlsNew, parentNodeNew, pos_col_new, pos_row_new) {
    controlsOld.keySort(Controller.getObjectSortFromPosCol());
    controlsNew.keySort(Controller.getObjectSortFromPosCol());

    var controlsTemp = TemplateList.getArrayControlFromColumn(controlsOld, pos_col_old);
    $.each(controlsTemp, function () {
      controlsOld.splice(controlsOld.indexOfObject(this), 1);
    });

    var itemSave = controlsTemp.splice(pos_row_old - 1, 1)[0];
    itemSave.pos_col = pos_col_new;
    // update new section_id
    if($(parentNodeNew).attr('section_id')){
      itemSave.section_id = $(parentNodeNew).attr('section_id');
      $(parentNodeNew).find('div[id="' + itemSave.control_id + '"]').attr('section_id', itemSave.section_id );
      $.each($(parentNodeNew).find('div[id="' + itemSave.control_id + '"]').find('div.droptrue.ui-sortable'),function(){
        $(this).attr('section_id', itemSave.section_id );
      });
    }
    // update control in pos_col_old
    var arrCtrsTmp = new Array();
    for (var i = 0; i < controlsTemp.length; i++) {
      var item = controlsTemp[i];
      item.pos_row = i + 1;
      arrCtrsTmp.push(item);
    }
    $.each(arrCtrsTmp, function () {
      $(parentNodeOld).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
    });
    controlsOld = controlsOld.concat(controlsTemp);

    var controlsTemp = TemplateList.getArrayControlFromColumn(controlsNew, pos_col_new);
    $.each(controlsTemp, function () {
      controlsNew.splice(controlsNew.indexOfObject(this), 1);
    });
    controlsTemp.splice(pos_row_new, 0, itemSave);
    // update control in pos_col_new
    var arrCtrsTmp = new Array();
    for (var i = 0; i < controlsTemp.length; i++) {
      var item = controlsTemp[i];
      item.pos_row = i + 1;
      arrCtrsTmp.push(item);
    }
    $.each(arrCtrsTmp, function () {
      $(parentNodeNew).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
    });
    controlsNew = controlsNew.concat(controlsTemp);

    return {
      controls_old: controlsOld,
      controls_new: controlsNew
    }
  };
  Controller.asyncItemsInControls = function (parentCtr,items, section_id, mode_copy) {
    $.each(items, function () {
      this.control_id = MainLayout.createNewControlId();
      this.section_id = section_id;
      if(parentCtr.map_type_control == 'radiogroup'
        && (typeof parentCtr.config != 'undefined' && typeof parentCtr.config.attributes != 'undefined' && typeof parentCtr.config.attributes.name != 'undefined')
        && (typeof this.config != 'undefined' && typeof this.config.attributes != 'undefined' && typeof this.config.attributes.name != 'undefined')){
        this.config.attributes.name = parentCtr.config.attributes.name;
      }
      if(parentCtr.map_type_control == 'checkboxgroup'
        && (typeof parentCtr.config != 'undefined' && typeof parentCtr.config.attributes != 'undefined' && typeof parentCtr.config.attributes.name != 'undefined')
        && (typeof this.config != 'undefined' && typeof this.config.attributes != 'undefined' && typeof this.config.attributes.name != 'undefined')){
        this.config.attributes.name = parentCtr.config.attributes.name;
      }
      if ((typeof this.config != 'undefined' && typeof this.config.attributes != 'undefined' && typeof this.config.attributes.name != 'undefined')
        && mode_copy){
        this.config.attributes.name = this.config.attributes.name + '_copy';
      }
      if (typeof this.config != 'undefined' && typeof this.config.items != 'undefined' && mode_copy) {
        Controller.asyncItemsInControls(this, this.config.items, section_id);
      }
    });
  };
  Controller.asyncControls = function (controls, section_id) {
    $.each(controls, function () {
      this.control_id = MainLayout.createNewControlId();
      this.section_id = section_id;
      if (typeof this.config != 'undefined' && typeof this.config.items != 'undefined') {
        Controller.asyncItemsInControls(this, this.config.items, section_id);
      }
    });
  };

  TemplateList = {
    data: [],
    getTemplateDetail: function (aTemplateId) {
      for (var i = 0; i < TemplateList.data.length; i++) {
        if (aTemplateId == TemplateList.data[i].id) {
          return TemplateList.data[i];
        }
      }
      return null;
    },
    getSectionDetail: function (aTemplateId, aSectionId) {
      var templateDetail = TemplateList.getTemplateDetail(aTemplateId);
      if (templateDetail) {
        for (var i = 0; i < templateDetail.sections.length; i++) {
          var section = templateDetail.sections[i];
          if (aSectionId == section.section_id) {
            return section;
          }
        }
      }
      return null;
    },
    getControlDetail: function (aTemplateId, aSectionId, aControlId) {
      var sectionDetail = TemplateList.getSectionDetail(aTemplateId, aSectionId);
      if (sectionDetail) {
        for (var i = 0; i < sectionDetail.controls.length; i++) {
          var control = sectionDetail.controls[i];
          if (aControlId == control.control_id) {
            return control;
          }
        }
      }
      return null;
    },
    findSectionIdInTemplate: function (aTemplateId, aSectionId) {
      var sectionDetail = TemplateList.getSectionDetail(aTemplateId, aSectionId);
      if (sectionDetail) {
        return true;
      }
      return false;
    },
    findControlIdInSection: function (aTemplateId, aSectionId, aControl) {
      var controlDetail = TemplateList.getControlDetail(aTemplateId, aSectionId, aControl);
      if (controlDetail) {
        return true;
      }
      return false;
    },
    findControlIdInTemplate: function (aTemplateId, aControlId) {
      var templateDetail = TemplateList.getTemplateDetail(aTemplateId);
      if (templateDetail) {
        for (var i in templateDetail.sections) {
          var sectionDetail = templateDetail.sections[i];
          for (var j in sectionDetail.controls) {
            var control = sectionDetail.controls[j];
            if (aControlId == control.control_id) {
              control.section_id = sectionDetail.section_id;
              return control;
            }
          }
        }
      }
      return null;
    },
    getArrayControlFromColumn: function (aControls, aCol) {
      return $.grep(aControls, function (v) {
        return parseInt(v.pos_col) == parseInt(aCol);
      });
    },
    /**
     * requestSaveMemcache
     *
     * @param {Function} callback
     */
    requestSaveBuilderJsonMemcache: function (jsonData, callback) {
      // ファイルの削除は、ガジェット内で新規申請書を開いている状態 --> トークンによるアクセス制御状態

      var template_id = $('#template_id').val();
      var copy_template_id = $('#copy_template_id').val();
      var copy_type = $('#copy_type').val();
      // added 2016-06-25: workflow template revision
      var revision_id = $('#revision_id').val();
      if(revision_id !== ''){
        var postParams = {
          //'token': USER_TOKEN,
          //'mode': IS_SHAREPOINT_MODE ? 'sharepoint' : '',		// SharePoint対応 2015.07.14
          'builder_json': jsonData,
          'revision_id': revision_id
        };
      }else {
          var postParams = {
            //'token': USER_TOKEN,
            //'mode': IS_SHAREPOINT_MODE ? 'sharepoint' : '',		// SharePoint対応 2015.07.14
            'builder_json': jsonData,
            'copy_template_id': copy_template_id,
            'copy_type': copy_type,
            'template_id': template_id
          };
      }
      // ファイルアップロードをリクエスト
      Ext.Ajax.request({
        params: postParams,
        url: SATERAITO_MY_SITE_URL + '/a/' + TENANT + '/htmlbuilder',
        method: 'POST',
        timeout: 1000 * 120,		// 120秒
        success: function (response, options) {
          // 成功時
          if (response.responseText == 'status=ok') {
            callback(true);
          } else {
            callback(false);
          }

        },
        failure: function (error) {
          // 失敗時
//          console.log(error);
          callback(false);
        }
      });
    },
    /**
     * requestGetTemplateDetail
     *
     * @param {Function} callback
     */
    requestGetTemplateDetail: function (template_id, callback) {
      // ファイルの削除は、ガジェット内で新規申請書を開いている状態 --> トークンによるアクセス制御状態

      var postParams = {
        //'token': USER_TOKEN,
        //'mode': IS_SHAREPOINT_MODE ? 'sharepoint' : '',		// SharePoint対応 2015.07.14
        'action': 'get_template_detail',
        'template_id': template_id
      };

      // ファイルアップロードをリクエスト
      Ext.Ajax.request({
        params: postParams,
        url: SATERAITO_MY_SITE_URL + '/a/' + TENANT + '/htmlbuilder',
        method: 'POST',
        timeout: 1000 * 120,		// 120秒
        success: function (response, options) {
          var jsonData = Ext.decode(response.responseText);
          callback(jsonData);
        },
        failure: function (error) {
          // 失敗時
//          console.log(error);
          callback(false);
        }
      });
    }
  };

  TrashTemplate = {
    data: [],
    getTemplateDetail: function (aTemplateId) {
      for (var i = 0; i < TrashTemplate.data.length; i++) {
        if (aTemplateId == TrashTemplate.data[i].id) {
          return TrashTemplate.data[i];
        }
      }
      return null;
    },
    getControlDetails: function (aTemplateId, aControlId) {
      var templateDetail = TrashTemplate.getTemplateDetail(aTemplateId);
      if (templateDetail) {
        for (var i = 0; i < templateDetail.controls.length; i++) {
          if (aControlId == templateDetail.controls[i].control_id) {
            return templateDetail.controls[i];
          }
        }
      }
      return null;
    },
    popControlInTrash: function (aTemplateId, aControlId) {
      var templateDetail = TrashTemplate.getTemplateDetail(aTemplateId);
      if (templateDetail) {
        for (var i = 0; i < templateDetail.controls.length; i++) {
          if (aControlId == templateDetail.controls[i].control_id) {
            var controlDetail = templateDetail.controls[i];
            templateDetail.controls.splice(i, 1);
            return controlDetail;
          }
        }
      }
      return null;
    },
    pushControlToTrash: function (aTemplateId, aTemplateName, aControlDetails) {
      var templateDetail = TrashTemplate.getTemplateDetail(aTemplateId);
      if (templateDetail) {
        templateDetail.name = aTemplateName;
        var controlDetails = TrashTemplate.getControlDetails(aTemplateId, aControlDetails.control_id);
        if (controlDetails) {
          controlDetails = aControlDetails;
        } else {
          if (!templateDetail.controls) {
            templateDetail.controls = new Array();
          }
          templateDetail.controls.push(clone(aControlDetails));
        }
      } else {
        var newTemplateDetail = new Object();
        newTemplateDetail.id = aTemplateId;
        newTemplateDetail.name = aTemplateName;
        newTemplateDetail.controls = new Array();
        newTemplateDetail.controls.push(clone(aControlDetails));
        TrashTemplate.data.push(newTemplateDetail);
      }
    }
  };

  MainLayout = {
    layout: [],
    elmTemplateList: null,
    elmLayoutMain: null,
    elmMainMatrix: null,
    elmTrashTemplate: null,
    posSection: 0,
    objectTmp: null,
    nextTab: function (aTabIndex) {
      aTabIndex = parseInt(aTabIndex);
      MyPanel.tabSet.setActiveTab(MyPanel.tabDefine[aTabIndex].name);
    },
    saveTemplate: function (aSilent) {
      if (typeof aSilent == 'undefined') {
        aSilent = false;
      }

      var template_id = MainLayout.elmTemplateList.val();
      var templateDetail = TemplateList.getTemplateDetail(template_id);
      var elmSections = MainLayout.elmMainMatrix.find('.infoBlk');
      //var elmSections = templateDetail.sections;
      var sections = [];
      var isFirst = true;
      $.each(elmSections, function () {
        var elmSection = this;
        var sectionDetail = TemplateList.getSectionDetail(template_id, elmSection.id);

        if (isFirst == true) {
          sectionDetail.className = 'infoBlk';
        } else {
          if (sectionDetail.show_header == true) {
            sectionDetail.className = 'infoBlk mgt25';
          } else {
            sectionDetail.className = 'infoBlk mgt5';
          }
        }
        isFirst = false;

        sections.push({
          section_id: sectionDetail.section_id,
          secname: sectionDetail.secname,
          collapsible: sectionDetail.collapsible,
          sec_class: sectionDetail.sec_class,
          sec_attr_name: sectionDetail.sec_attr_name,
          sec_attrs: sectionDetail.sec_attrs,
          column_cof: sectionDetail.column_cof,
          show_header: sectionDetail.show_header,
          show_inner_header: sectionDetail.show_inner_header,
          setting_inner_header: sectionDetail.setting_inner_header,
          controls: sectionDetail.controls
        })
      });
      templateDetail.sections = sections;
      if (aSilent == false) {
        var template_id = MainLayout.elmTemplateList.val();
        var trashTemplateDetail = TrashTemplate.getTemplateDetail(template_id);

        if (!trashTemplateDetail) {
          trashTemplateDetail = {};
          trashTemplateDetail.id = template_id;
          trashTemplateDetail.name = templateDetail.name;
          trashTemplateDetail.controls = new Array();
        }

        MainLayout.nextTab(1);
      }
    },
    moveUpSection: function (aElm) {
      var template_id = MainLayout.elmTemplateList.val();
      var templateDetail = TemplateList.getTemplateDetail(template_id);
      var section_id = $(aElm).attr('section_id');
      var section = TemplateList.getSectionDetail(template_id, section_id);
      var indexOf = templateDetail.sections.indexOfObject(section);
      if (indexOf > 0) {
        var sectionTmp = templateDetail.sections.splice(indexOf, 1)[0];
        templateDetail.sections.splice(indexOf - 1, 0, sectionTmp);
        MainLayout.init();
      }
    },
    moveDownSection: function (aElm) {
      var template_id = MainLayout.elmTemplateList.val();
      var templateDetail = TemplateList.getTemplateDetail(template_id);
      var section_id = $(aElm).attr('section_id');
      var section = TemplateList.getSectionDetail(template_id, section_id);
      var indexOf = templateDetail.sections.indexOfObject(section);
      if (indexOf < templateDetail.sections.length) {
        var sectionTmp = templateDetail.sections.splice(indexOf, 1)[0];
        templateDetail.sections.splice(indexOf + 1, 0, sectionTmp);
        MainLayout.init();
      }
    },
    randomStringId: function (aName) {
      // create new template id string
      // create 16-length random string
      var s = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
      var random_string = '';
      for (var i = 0; i < 16; i++) {
        var index = Math.floor(Math.random() * s.length);
        random_string += s[index];

      }
      // create date string
      var now = new Date();
      var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
      var date_string = utc.getTime();
      //create new id
      return aName + '-' + date_string + random_string;
    },
    createNewSectionId: function () {
      return MainLayout.randomStringId('sec_id');
    },
    createNewControlId: function () {
      return MainLayout.randomStringId('ctr_id');
    },
    init: function (callback) {

      MainLayout.elmTemplateList = $('#templatelist');
      MainLayout.elmLayoutMain = $('#layoutMain');
      MainLayout.elmMainMatrix = $('#mainMatrix');
      MainLayout.elmTrashTemplate = $('#sortable_trash');
      MainLayout.elmSateraitoFormScript = $('#sateraito_form_script_render');

      // empty elmTemplateList
      MainLayout.elmTemplateList.empty();
      // load templates
      MainLayout.addOptToElmTemplateList();

      MainLayout.loadMainMatrix();

      MainLayout.elmTemplateList.change(function () {
        MainLayout.loadMainMatrix(MainLayout.elmTemplateList.val());
      });

      if (typeof callback == 'function') {
        callback();
      }
    },
    reload: function (callback) {
      // load templates
      MainLayout.addOptToElmTemplateList();

      if (typeof callback == 'function') {
        callback();
      }

    },
    addOptToElmTemplateList: function () {
      // empty elmTemplateList
      MainLayout.elmTemplateList.empty();
      // load templates
      var templates = TemplateList.data;

      for (var i = 0; i < templates.length; i++) {
        var item = templates[i];
        MainLayout.elmTemplateList.append('<option value="' + item.id + '" selected>' + item.name + '</option>');
      }
    },
    setEventToggleSection: function () {
      $.each(MainLayout.elmMainMatrix.find('.toggle_section'), function () {
        var toggle_secion = this;
        $(toggle_secion).unbind('click');
        $(toggle_secion).click(function () {
          var elmSection = $('#' + $(this).attr('section_id'));
          var _this = this;
          elmSection.find(".tblCtrls").slideToggle(200, function () {
            // Animation complete.
            if ($(_this).attr('status') == 'up') {
              $(_this).attr('status', 'down');

              $(_this).attr('class', 'toggle_section x-tool toggle-')
            } else {
              $(_this).attr('status', 'up');
              $(_this).attr('class', 'toggle_section x-tool toggle_plus')
            }
          });
        });
      })
    },
    loadMainMatrix: function (aTemplateId) {
      // empty elmMainMatrix
      MainLayout.elmMainMatrix.html('');
      var template_id;
      if (typeof aTemplateId == 'undefined') {
        template_id = MainLayout.elmTemplateList.val();
      } else {
        template_id = aTemplateId;
      }

      // load template list
      var templateDetail = TemplateList.getTemplateDetail(template_id);

      if (templateDetail) {
        var sections = templateDetail.sections;
        for (var i = 0; i < sections.length; i++) {
          var section = sections[i];
          MainLayout.createSection(section);
        }

        MainLayout.setEventToggleSection();
      }
      // create sec_sateraito_from_script
      if (MainLayout.sateraito_script) {
        var sec_sateraito_from_script = {
          section_id: 'sec_sateraito_from_script',
          secname: MyLang.getMsg('MSG_INPUT_JAVASCRIPT_SECTION')
        };
        var vHtml = '';
        vHtml += MainLayout.createHtmlHeaderSection(sec_sateraito_from_script, true);
        vHtml += '<table class="tblCtrls" id="sec_sateraito_from_script_table" style="display: none;">';
        vHtml += '<tr>';
        vHtml += '<td>';
        vHtml += '<textarea name="sateraito_from_script_content" cols="1" rows="5" style="width: 100%;resize:both;" >';
        vHtml += MainLayout.sateraito_script.textContent;
        vHtml += '</textarea>';
        vHtml += '</td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        var elm = document.createElement('div');
        elm.id = sec_sateraito_from_script.section_id;
        elm.className = 'infoBlk mgt25';
        elm.innerHTML = vHtml;
        MainLayout.elmSateraitoFormScript.html('');
        MainLayout.elmSateraitoFormScript.append(elm);
        MainLayout.elmSateraitoFormScript.find('textarea[name="sateraito_from_script_content"]').mouseout(function () {
          MainLayout.sateraito_script.textContent = $(this).val();
        });
        MainLayout.elmSateraitoFormScript.find('textarea[name="sateraito_from_script_content"]').keydown(function () {
          MainLayout.sateraito_script.textContent = $(this).val();
        });
        $('#toggle_' + sec_sateraito_from_script.section_id).click(function () {
          var _this = this;
          $("#sec_sateraito_from_script_table").slideToggle(200, function () {
            // Animation complete.
            if ($(_this).attr('status') == 'up') {
              $(_this).attr('status', 'down');

              $(_this).attr('class', 'x-tool toggle-')
            } else {
              $(_this).attr('status', 'up');
              $(_this).attr('class', 'x-tool toggle_plus')
            }
          });
        });
      }
      // load trash template list
      MainLayout.loadTrashTemplate(template_id);
    },
    loadTrashTemplate: function (aTemplateId) {
      MainLayout.elmTrashTemplate.html('');
      var trashTemplateDetail = TrashTemplate.getTemplateDetail(aTemplateId);
      if (trashTemplateDetail) {
        var controls = trashTemplateDetail.controls;
        for (var i = 0; i < controls.length; i++) {
          var control = controls[i];
          MainLayout.elmTrashTemplate.append(MainLayout.createHtmlDivControl(control.section_id, control));
        }
      }
    },
    deleteForeverTrash: function () {
      // 最終確認メッセージ表示
      Ext.Msg.show({
        //title: MyLang.getMsg('SATERAITO_BBS'),
        icon: Ext.MessageBox.QUESTION,
        msg: MyLang.getMsg('MSG_DELETE_COMP'),
        buttons: Ext.Msg.OKCANCEL,
        fn: function (buttonId) {
          if (buttonId == 'ok') {
            var template_id = MainLayout.elmTemplateList.val();
            var templateDetail = TemplateList.getTemplateDetail(template_id);
            if (templateDetail) {
              var trashTemplateDetail = TrashTemplate.getTemplateDetail(template_id);
              if (trashTemplateDetail) {
                trashTemplateDetail.controls = new Array();
                $('#sortable_trash').html('');
              }
            }
          }
        }
      });
    },
    updateCfg: function () {
      MainLayout.setEventToggleSection();
      MainLayout.processInitEvents();
    },
    showCreateNewCF: function () {
      if (MainLayout.hasSelectedTemplate() == false) {
        return;
      }
      var template_id = MainLayout.elmTemplateList.val();
      var templateDetail = TemplateList.getTemplateDetail(template_id);
      if (templateDetail && templateDetail.sections.length == 0) {
        Ext.Msg.show({
          icon: Ext.MessageBox.INFO,
          msg: MyLang.getMsg('MSG_MUST_CREATE_SECTION'),
          buttons: Ext.Msg.OK
        });
        return;
      }
      PopupToolsCtr.show(null, function (aJsonData) {
        var template_id = MainLayout.elmTemplateList.val();
        var section_id = aJsonData.section_id;
        var map_type = aJsonData.map_type;
        var sectionDetail = TemplateList.getSectionDetail(template_id, section_id);
        var controls = sectionDetail.controls;

        var column_section = aJsonData.column_section;
        if (map_type == 'serial_number') {
          var serial_number_setting = aJsonData.serial_number_setting;

          if (serial_number_setting.direction == 'horizontal') {
            for (var i = column_section; i <= sectionDetail.column_cof; i++) {
              controls.keySort(Controller.getObjectSortFromPosCol());
              var controlsTmp = TemplateList.getArrayControlFromColumn(controls, i);
              $.each(controlsTmp, function () {
                controls.splice(controls.indexOfObject(this), 1);
              });

              var control_id = MainLayout.createNewControlId();
              var control = clone(Controller.MapType['label']);
              control.map_type_control = 'label';
              control.control_id = control_id;
              control.pos_col = i;
              control.pos_row = controlsTmp.length + 1;

              var lblname = serial_number_setting.custom_name + i;
              control.config.attributes.lblname = lblname;
              control.config.attributes.style = serial_number_setting.style;
              control.config.attributes.class = serial_number_setting.class;

              controlsTmp.push(control);
              sectionDetail.controls = sectionDetail.controls.concat(controlsTmp);
            }
          } else { // Vertical
            controls.keySort(Controller.getObjectSortFromPosCol());
            var controlsTmp = TemplateList.getArrayControlFromColumn(controls, column_section);
            $.each(controlsTmp, function () {
              controls.splice(controls.indexOfObject(this), 1);
            });
            for (var i = 0; i < serial_number_setting.length; i++) {
              var control_id = MainLayout.createNewControlId();
              var control = clone(Controller.MapType['label']);
              control.map_type_control = 'label';
              control.control_id = control_id;
              control.pos_col = column_section;
              control.pos_row = controlsTmp.length + 1;

              var lblname = serial_number_setting.custom_name + (i + 1);
              control.config.attributes.lblname = lblname;
              control.config.attributes.style = serial_number_setting.style;
              control.config.attributes.class = serial_number_setting.class;
              controlsTmp.push(control);
            }
            sectionDetail.controls = sectionDetail.controls.concat(controlsTmp);
          }
        } else {

          controls.keySort(Controller.getObjectSortFromPosCol());
          var controlsTmp = TemplateList.getArrayControlFromColumn(controls, column_section);
          $.each(controlsTmp, function () {
            controls.splice(controls.indexOfObject(this), 1);
          });

          for (var i = 0; i < aJsonData.number_control; i++) {
            var aJsonDataTmp = clone(aJsonData);
            var attributes = aJsonDataTmp.attributes;
            var control_id = MainLayout.createNewControlId();
            var control = {};
            control.control_id = control_id;
            control.map_type_control = map_type;
            control.pos_col = column_section;

            control.pos_row = controlsTmp.length + 1;
            control.config = {};
            control.config.attributes = attributes;
            var name = attributes.name != undefined ? attributes.name : '';
            if (i > 0) {
              name += '' + i;
            }
            control.config.attributes.name = name;

            if (typeof aJsonDataTmp.items != 'undefined') {
              var items = aJsonDataTmp.items;
              Controller.asyncItemsInControls(control, items, section_id);
              control.config.items = items;
            }
            if (typeof aJsonDataTmp.html != 'undefined') {
              control.config.html = aJsonDataTmp.html;
            }
            controlsTmp.push(control);
          }
          sectionDetail.controls = sectionDetail.controls.concat(controlsTmp);
        }
        MainLayout.updateControlInSection(sectionDetail);
      });
    },
    showPopupEditCtr: function (elm) {
      var control_id = $(elm).attr('control_id');
      var controlDetail = TemplateList.findControlIdInTemplate(MainLayout.elmTemplateList.val(), control_id);
      if (controlDetail) {

        PopupToolsCtr.show(controlDetail, function (aJsonData) {

          var template_id = MainLayout.elmTemplateList.val();
          var section_id = controlDetail.section_id;
          if (aJsonData.mode_delete == true) {
            var sectionId = section_id;
            var templateId = MainLayout.elmTemplateList.val();
            var templateName = TemplateList.getTemplateDetail(templateId).name;
            var section = TemplateList.getSectionDetail(templateId, sectionId);
            var controls = section.controls;
            controls.keySort(Controller.getObjectSortFromPosCol());

            var controlsTemp = TemplateList.getArrayControlFromColumn(controls, controlDetail.pos_col);
            $.each(controlsTemp, function () {
              controls.splice(controls.indexOfObject(this), 1);
            });
            var itemSave = controlsTemp.splice(controlDetail.pos_row - 1, 1)[0];

            for (var i = 0; i < controlsTemp.length; i++) {
              var item = controlsTemp[i];
              item.pos_row = i + 1;
            }

            section.controls = section.controls.concat(controlsTemp);
            // TrashTemplate.pushControlToTrash(templateId, templateName, itemSave);
            MainLayout.updateControlInSection(section);
            return;
          }

          var map_type = aJsonData.map_type;
          var attributes = aJsonData.attributes;
          var sectionDetail = TemplateList.getSectionDetail(template_id, section_id);
          controlDetail.map_type_control = map_type;
          controlDetail.config.attributes = attributes;
          if (typeof aJsonData.items != 'undefined') {
            controlDetail.config.items = clone(aJsonData.items);
            Controller.asyncItemsInControls(controlDetail, controlDetail.config.items, section_id);
          }
          if (typeof aJsonData.html != 'undefined') {
            controlDetail.config.html = clone(aJsonData.html);
          }

          if (aJsonData.mode_save_and_copy == true) {
            var controls = sectionDetail.controls;
            controls.keySort(Controller.getObjectSortFromPosCol());
            var controlsTmp = TemplateList.getArrayControlFromColumn(controls, controlDetail.pos_col);
            var idx = controlsTmp.indexOfObject(controlDetail);
            var controlCopy = clone(controlDetail);
            controlCopy.control_id = MainLayout.createNewControlId();
            controlCopy.config.attributes.name += '_copy';
            controlCopy.config.attributes.lblname += MyLang.getMsg('MSG_COMP_COPY');
            if (typeof controlCopy.config.items != 'undefined') {
              Controller.asyncItemsInControls(controlCopy, controlCopy.config.items, section_id);
            }
            $.each(controlsTmp, function () {
              controls.splice(controls.indexOfObject(this), 1);
            });
            controlsTmp.splice(idx + 1, 0, controlCopy);

            for (var i = 0; i < controlsTmp.length; i++) {
              var item = controlsTmp[i];
              item.pos_row = i + 1;
            }

            sectionDetail.controls = sectionDetail.controls.concat(controlsTmp);
          }

          MainLayout.updateControlInSection(sectionDetail);
        });

      }
    },
    processInitEvents: function () {

      debugLog('=> function processInitEvents()');
//      var elmInfoBlks =MainLayout.elmMainMatrix.find('div.infoBlk');
//      for(var i=0; i<elmInfoBlks.length; i++){
//        elmInfoBlks[i].className = 'infoBlk';
//        //break;
//      }
      /*function addEventCheckboxCls(ctr){
       ctr.mouseover(function(){
       if($(this).find('input.chkbxcls').length == 0){
       $(this).append('<input type="checkbox" class="chkbxcls">');
       }
       $(this).find('input.chkbxcls').show()
       });
       ctr.mouseout(function(){
       $(this).find('input.chkbxcls').hide();
       });
       }*/

      function addEventEditCls(ctr) {
        function addImgEdit(_this, editItemInCellGrid) {
          if (typeof editItemInCellGrid === 'undefined') {
            editItemInCellGrid = false;
          }
          if (!editItemInCellGrid) {
            $(_this).find('td.pos_import_edit').append('<span control_id="' + _this.id + '" section_id="' + $(_this).attr('section_id') + '" onclick="MainLayout.showPopupEditCtr(this)" class="img_edit_ctr floatR"></span>');
          } else {
            $(_this).find('td.pos_import_edit').append('<span control_id="' + _this.id + '" section_id="' + $(_this).attr('section_id') + '" onclick="GridUtil.go_edit_ctr_cell_grid(this)" class="img_edit_ctr floatR"></span>');
          }
        }

        ctr.mouseover(function () {
          var $img = $(this).find('.img_edit_ctr'),
            parent = $(this).parent(),
            functionEditCtrCellGridName = 'GridUtil.go_edit_ctr_cell_grid(this)',
            functionEditCtr = 'MainLayout.showPopupEditCtr(this)';
          if (parent.attr('in_grid') && parent.attr('in_grid') === "true") {
            if ($img.length == 0) {
              addImgEdit(this, true);
            } else {
              if ($img.attr('onclick') != functionEditCtrCellGridName) {
                $img.attr('onclick', functionEditCtrCellGridName)
              }
            }
          } else {
            if ($img.length == 0) {
              //$(this).append('<img control_id="'+this.id+'" onclick="MainLayout.showPopupEditCtr(this)" class="img_edit_ctr" style="width: 16px;height: 16px" src="' + BASE_URL + '/images/icons/tools.png' + '">');
              //<img class="dotLine floatL" src="'+BASE_URL+'/images/icons/spacer.gif" alt="">
              addImgEdit(this);
            }else{
              if ($img.attr('onclick') != functionEditCtr) {
                $img.attr('onclick', functionEditCtr)
              }
            }
          }
          $img.show()
        });
        ctr.mouseout(function () {
          var $img = $(this).find('.img_edit_ctr');
          $img.hide();
        });
      }

      $('table[gridEditor=true]').off('click', '.cell-sortable');
      $('table[gridEditor=true]').on('click', '.cell-sortable', GridUtil.handlerOnClick);

      $('.ui-sortable').sortable({
        placeholder: "dragging_highlight",
        scroll: true,
        revert: false,
        cancel: '.img_edit_ctr',
        forcePlaceholderSize: true,
        tolerance: "pointer",
        cursorAt: { top: 15, left: 10},
        start: function (event, ui) {
          // modify ui.placeholder however you like
          var marginTop = 0;
          if ($(ui.item).attr('class').search('mgt25') > -1) {
            marginTop = 25
          }
//          ui.placeholder.css({ height: $(ui.item).css('height'), marginTop: marginTop, marginBottom: 0});
          ui.placeholder.css({ marginTop: marginTop, marginBottom: 0});
        },
        beforeStop: function (event, ui) {
        },
        stop: function (event, ui) {
          debugLog('DRAG-START: ui-sortable ');
          var re = true;
          if (ui.item.attr('move_trash') == 'false' && ui.item[0].parentNode.id == 'sortable_trash') {
            re = false;
            setTimeout(function () {
              Ext.Msg.show({
                icon: Ext.MessageBox.INFO,
                msg: MyLang.getMsg('MSG_COMP_DROP_DRAG_ERR'),
                buttons: Ext.Msg.OK
              });
            }, 50);
          }
          MainLayout.saveTemplate(true);
          debugLog('DRAG-END: ui-sortable ');
          return re;
        }
      }).disableSelection();


      $("div.droptrue").sortable({
        connectWith: ".droptrue",
        placeholder: "dragging_highlight",
        scroll: true,
        revert: false,
        forcePlaceholderSize: true,
        tolerance: "pointer",
        items: "> .item_jig",
        cursorAt: { top: 15, left: 10},
        start: function (event, ui) {
//          ui.placeholder.css({height: $(ui.item).css('height'), marginTop: 0, marginBottom: 0});
          var parent = ui.item[0].parentNode;
//          $(parent).find('.item_jig').each(function(idx, item){
          $(parent).find('> .item_jig').each(function(idx, item){
            $(item).attr('pos_row', idx + 1);
          });
          var beforeElm = $(ui.item[0]).prev();
          var pos_row = 1;
          if (beforeElm.length == 0) {
          } else {
            pos_row = parseInt($(beforeElm[0]).attr('pos_row')) + 1;
          }
          MainLayout.objectTmp = new ObjectsTemporary();
          MainLayout.objectTmp.set({
            parent: parent,
            beforeElm: beforeElm,
            pos_row: pos_row
          });
        },
        stop: function (event, ui) {
          debugLog(' => DRAG-START: droptrue ');
          var parentNodeNew = ui.item[0].parentNode;
          var pos_col_new = parseInt($(parentNodeNew).attr('pos_col'));
          var sectionIdNew = $(parentNodeNew).attr('section_id');
          var templateId = MainLayout.elmTemplateList.val();
          var sectionNew = TemplateList.getSectionDetail(templateId, sectionIdNew);

          var objectTmp = MainLayout.objectTmp.get();
          var parentNodeOld = objectTmp.parent;
          var beforeElmOld = objectTmp.beforeElm;
          var pos_row_old = objectTmp.pos_row;
          var pos_col_old = parseInt($(parentNodeOld).attr('pos_col'));
          var is_grid_control = false, drag_to_in_grid = false, drag_to_out_grid = false;

          if ($(ui.item[0]).attr('map_type') && $(ui.item[0]).attr('map_type') === 'grid') {
            debugLog(' *** GRID CONTROL');
            is_grid_control = true;
          }
          if ($(parentNodeNew).attr('in_grid') && $(parentNodeNew).attr('in_grid') === 'true') {
            debugLog(' *** DRAG TO IN GRID');
            drag_to_in_grid = true;
          }
          if ($(parentNodeOld).attr('in_grid') && $(parentNodeOld).attr('in_grid') === 'true') {
            debugLog(' *** DRAG TO OUT GRID');
            drag_to_out_grid = true;
          }
          if (is_grid_control === true && drag_to_in_grid === true) {
            return false;
          }

          // check jig: in only section
          if ($(parentNodeOld).attr('section_id') == $(parentNodeNew).attr('section_id')) {
            if (drag_to_in_grid === true) {
              var sectionIdOld = $(parentNodeOld).attr('section_id');
              var sectionOld = TemplateList.getSectionDetail(templateId, sectionIdOld);
              var controlGrid = TemplateList.getControlDetail(templateId, sectionIdNew, $(parentNodeNew).attr('control_id'));

              var beforeCtrCellId = null;
              var beforeElmNew = $(ui.item[0]).prev();
              var pos_row_new = 0;
              if (beforeElmNew.length > 0) {
                pos_row_new = parseInt($(beforeElmNew[0]).attr('pos_row'));
                beforeCtrCellId = beforeElmNew[0].id;
              }

              if (drag_to_out_grid === true) {
                // 1- Only grid:
                //   case 1: move control in cell grid
                //   case 2: move control in other cell grid
                // 2- Other grid:
                var gridNameOld = Controller.findGridNameByControl(parentNodeOld);
                var gridNameNew = Controller.findGridNameByControl(parentNodeNew);
                if(gridNameOld != null && gridNameNew != null && gridNameOld == gridNameNew){
                  debugLog('*** Only grid');
                  Controller.moveControlInGrid(controlGrid.config.items, parentNodeOld, pos_row_old, parentNodeNew, pos_row_new, beforeCtrCellId);
                }else{
                  debugLog('*** Other grid');
                  var sectionIdOld = $(parentNodeOld).attr('section_id');
                  var sectionOld = TemplateList.getSectionDetail(templateId, sectionIdOld);
                  var controlGridOld = TemplateList.getControlDetail(templateId, sectionIdOld, $(parentNodeOld).attr('control_id'));
                  var controlGridNew = TemplateList.getControlDetail(templateId, sectionIdNew, $(parentNodeNew).attr('control_id'));

                  var beforeElmNew = $(ui.item[0]).prev();
                  var pos_row_new = 0;
                  if (beforeElmNew.length > 0) {
                    pos_row_new = parseInt($(beforeElmNew[0]).attr('pos_row'));
                  }
                  Controller.moveCellControlToGrid(controlGridOld.config.items, parentNodeOld, pos_row_old, controlGridNew.config.items, parentNodeNew, pos_row_new);
                }
                return true;
              }

              debugLog('*** MOVE: control to grid');
              // case 2: control to grid
              sectionOld.controls = Controller.moveControlToGrid(sectionOld.controls, parentNodeOld, pos_col_old, pos_row_old, controlGrid.config.items, parentNodeNew, pos_row_new);
              return true;
            }
            if (drag_to_out_grid === true) {
              debugLog('*** MOVE: control from cell grid to section');
              var sectionIdOld = $(parentNodeOld).attr('section_id');
              // var sectionOld = TemplateList.getSectionDetail(templateId, sectionIdOld);
              var controlGrid = TemplateList.getControlDetail(templateId, sectionIdOld, $(parentNodeOld).attr('control_id'));

              var beforeElmNew = $(ui.item[0]).prev();
              var pos_row_new = 0;
              if (beforeElmNew.length > 0) {
                pos_row_new = parseInt($(beforeElmNew[0]).attr('pos_row'));
              }
              sectionNew.controls = Controller.moveControlOutGrid(controlGrid.config.items, parentNodeOld, pos_row_old, sectionNew.controls, parentNodeNew, pos_col_new, pos_row_new);
              return true;
            }
            // in only section
            if ($(parentNodeOld).attr('pos_col') == $(parentNodeNew).attr('pos_col')) {
              // parentNodeOld.pos_col = parentNodeNew.pos_col
              var beforeElmNew = $(ui.item[0]).prev();
              var pos_row_new = 1;
              if (beforeElmNew.length > 0) {
                if ($(beforeElmNew).attr('pos_row') == $(beforeElmOld).attr('pos_row')) {
                  // no update
                  return
                }
                // update
                // update pos_col: $(parentNodeNew).attr('pos_col')

                if (parseInt($(beforeElmOld).attr('pos_row')) > parseInt($(beforeElmNew).attr('pos_row'))) {
                  pos_row_new = parseInt($(beforeElmNew[0]).attr('pos_row')) + 1;
                } else {
                  pos_row_new = parseInt($(beforeElmNew[0]).attr('pos_row'));
                }

                var controls = sectionNew.controls;
                sectionNew.controls = Controller.changePosControlInControlsSamePosCol(controls, parentNodeNew, pos_col_new, pos_row_old, pos_row_new);


              } else {
                if (beforeElmOld.length == 0) {
                  // no update
                  return
                }
                // update
                // update pos_col: $(parentNodeNew).attr('pos_col');
                var controls = sectionNew.controls;
                sectionNew.controls = Controller.changePosControlInControlsSamePosCol(controls, parentNodeNew, pos_col_new, pos_row_old, pos_row_new);

              }
            } else {
              // parentNodeOld.pos_col != parentNodeNew.pos_col

              var beforeElmNew = $(ui.item[0]).prev();
              var pos_row_new = 0;
              if (beforeElmNew.length > 0) {
                pos_row_new = parseInt($(beforeElmNew[0]).attr('pos_row'));
              }
              var controls = sectionNew.controls;
              sectionNew.controls = Controller.changePosControlInControlsNotSamePosCol(controls, parentNodeOld, pos_col_old, pos_row_old, parentNodeNew, pos_col_new, pos_row_new);
              return true;
            }
          }
          else {
            // parentNodeOld != parentNodeNew
            // check is trash
            if (parentNodeNew.id == 'sortable_trash') {
              // parentNodeNew is sortable_trash
              var re = true;
              if (ui.item.attr('move_trash') == 'false' && ui.item[0].parentNode.id == 'sortable_trash') {
                re = false;
                setTimeout(function () {
                  Ext.Msg.show({
                    icon: Ext.MessageBox.INFO,
                    msg: MyLang.getMsg('MSG_COMP_DROP_DRAG_ERR'),
                    buttons: Ext.Msg.OK
                  });
                }, 50)
              }

              if (ui.item[0].parentNode.id == 'sortable_trash') {
                ui.item.unbind("mouseover");
                ui.item.unbind("mouseout");
                if (ui.item.find('img.img_edit_ctr').length > 0) {
                  ui.item.find('img.img_edit_ctr').hide();
                }
                /*if(ui.item.find('input.chkbxcls').length>0){
                 ui.item.find('input.chkbxcls').hide();
                 }*/
              }
              if (re == false) {
                addEventEditCls(ui.item);
              } else if (ui.item[0].parentNode.id == 'sortable_trash') {

                var controlId = ui.item[0].id;
                var sectionId = $(ui.item[0]).attr('section_id');
                var templateId = MainLayout.elmTemplateList.val();
                var templateName = TemplateList.getTemplateDetail(templateId).name;
                var section = TemplateList.getSectionDetail(templateId, sectionId);
                var controls = section.controls;
                controls.keySort(Controller.getObjectSortFromPosCol());

                if (drag_to_out_grid === true) {
                  var sectionIdOld = $(parentNodeOld).attr('section_id');
                  var sectionOld = TemplateList.getSectionDetail(templateId, sectionIdOld);
                  var controlGrid = TemplateList.getControlDetail(templateId, sectionIdOld, $(parentNodeOld).attr('control_id'));
                  var items_grid_class = controlGrid.config.items;

                  var cell_key = $(parentNodeOld).attr('cell_key');
                  var cell = items_grid_class.getCellFromKey(cell_key);
                  // cell.addControls([itemSave]);
                  var ctrsInCell = cell.getControls();
                  ctrsInCell.keySort(Controller.getObjectSortFromPosCol());

                  var controlsTemp = TemplateList.getArrayControlFromColumn(ctrsInCell, -1);
                  $.each(controlsTemp, function () {
                    ctrsInCell.splice(ctrsInCell.indexOfObject(this), 1);
                  });
                  var itemSave = controlsTemp.splice(pos_row_old - 1, 1)[0];
                  // controlsTemp.splice(pos_row_new, 0, itemSave);
                  // update control in pos_col_new
                  var arrCtrsTmp = new Array();
                  for (var i = 0; i < controlsTemp.length; i++) {
                    var item = controlsTemp[i];
                    item.pos_row = i + 1;
                    arrCtrsTmp.push(item);
                  }
                  $.each(arrCtrsTmp, function () {
                    $(parentNodeNew).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
                  });
                  ctrsInCell = ctrsInCell.concat(controlsTemp);
                  cell.setControls(ctrsInCell);
                } else {
                  var controlsTemp = TemplateList.getArrayControlFromColumn(controls, pos_col_old);
                  $.each(controlsTemp, function () {
                    controls.splice(controls.indexOfObject(this), 1);
                  });
                  var itemSave = controlsTemp.splice(pos_row_old - 1, 1)[0];

                  var arrCtrsTmp = new Array();
                  for (var i = 0; i < controlsTemp.length; i++) {
                    var item = controlsTemp[i];
                    item.pos_row = i + 1;
                    arrCtrsTmp.push(item);
                  }
                  $.each(arrCtrsTmp, function () {
                    $(parentNodeOld).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
                  });

                  section.controls = section.controls.concat(controlsTemp);
                }

                TrashTemplate.pushControlToTrash(templateId, templateName, itemSave);
              }

              return re;
              // do something
            } else {
              if (drag_to_in_grid === true) {
                if (drag_to_out_grid === true) {
                  debugLog('*** MOVE CASE 1: control from cell grid to other grid');

                  var sectionIdOld = $(parentNodeOld).attr('section_id');
                  var sectionOld = TemplateList.getSectionDetail(templateId, sectionIdOld);
                  var controlGridOld = TemplateList.getControlDetail(templateId, sectionIdOld, $(parentNodeOld).attr('control_id'));
                  var controlGridNew = TemplateList.getControlDetail(templateId, sectionIdNew, $(parentNodeNew).attr('control_id'));

                  var beforeElmNew = $(ui.item[0]).prev();
                  var pos_row_new = 0;
                  if (beforeElmNew.length > 0) {
                    pos_row_new = parseInt($(beforeElmNew[0]).attr('pos_row'));
                  }
                  Controller.moveCellControlToGrid(controlGridOld.config.items, parentNodeOld, pos_row_old, controlGridNew.config.items, parentNodeNew, pos_row_new);
                } else {
                  debugLog('*** MOVE CASE 2: control grid to other grid');

                  var sectionIdOld = $(parentNodeOld).attr('section_id');
                  var sectionOld = TemplateList.getSectionDetail(templateId, sectionIdOld);
                  var controlGridOld = TemplateList.getControlDetail(templateId, sectionIdOld, $(parentNodeOld).attr('control_id'));
                  var controlGridNew = TemplateList.getControlDetail(templateId, sectionIdNew, $(parentNodeNew).attr('control_id'));

                  var beforeElmNew = $(ui.item[0]).prev();
                  var pos_row_new = 0;
                  if (beforeElmNew.length > 0) {
                    pos_row_new = parseInt($(beforeElmNew[0]).attr('pos_row'));
                  }
                  sectionOld.controls = Controller.moveControlToGrid(sectionOld.controls, parentNodeOld, pos_col_old, pos_row_old, controlGridNew.config.items, parentNodeNew, pos_row_new);

                }
                return true;
              }
              if (drag_to_out_grid === true) {
                var sectionIdOld = $(parentNodeOld).attr('section_id');
                var sectionOld = TemplateList.getSectionDetail(templateId, sectionIdOld);
                var controlGrid = TemplateList.getControlDetail(templateId, sectionIdOld, $(parentNodeOld).attr('control_id'));

                debugLog('*** MOVE: control from cell grid to other section');
                sectionNew.controls = Controller.moveControlOutGrid(controlGrid.config.items, parentNodeOld, pos_row_old, sectionNew.controls, parentNodeNew, pos_col_new, pos_row_new);
                return true;
              }
              var sectionIdOld = $(parentNodeOld).attr('section_id');
              var sectionOld = TemplateList.getSectionDetail(templateId, sectionIdOld);
              // parentNodeNew is other section
              // do something
              var beforeElmNew = $(ui.item[0]).prev();
              var pos_row_new = 0;
              if (beforeElmNew.length > 0) {
                pos_row_new = parseInt($(beforeElmNew[0]).attr('pos_row'));
              }
              var objResult = Controller.moveControlToOrtherSection(sectionOld.controls, parentNodeOld, pos_col_old, pos_row_old, sectionNew.controls, parentNodeNew, pos_col_new, pos_row_new);
              sectionOld.controls = objResult.controls_old;
              sectionNew.controls = objResult.controls_new;
            }
          }

          // step 1
          // update control section_old
          debugLog(' => DRAG-END: droptrue ')
        }
        //revert: true
      }).disableSelection();

      $("#sortable_trash").sortable({
        connectWith: ".droptrue",
        placeholder: "dragging_highlight",
        scroll: true,
        revert: false,
        forcePlaceholderSize: true,
        tolerance: "pointer",
        cursorAt: { top: 15, left: 10},
//        start: function (event, ui) {
//          ui.placeholder.css({ height: $(ui.item).css('height'), marginTop: 0, marginBottom: 0});
//        },
        stop: function (event, ui) {
          debugLog(" => DRAG-START: sortable_trash");
          //addEventCheckboxCls(ui.item);
          var template_id = MainLayout.elmTemplateList.val();
          var sectionIdNew = $(ui.item[0].parentNode).attr('section_id');
          var parentNodeNew = ui.item[0].parentNode;
          var pos_col_new = parseInt($(ui.item[0].parentNode).attr('pos_col'));
          var sectionNew = TemplateList.getSectionDetail(template_id, sectionIdNew);
          var controlsNew = sectionNew.controls;

          if (sectionNew) {
            var drag_to_in_grid = false;
            if ($(parentNodeNew).attr('in_grid') && $(parentNodeNew).attr('in_grid') === 'true') {
              debugLog(' *** DRAG TO IN GRID');
              drag_to_in_grid = true;
            }
            var controlOld = TrashTemplate.popControlInTrash(template_id, ui.item[0].id);
            if(controlOld.map_type_control == 'grid'){
              controlOld.config.items = GridUtil.createObjToGridClass(controlOld.config.items);
              $(parentNodeNew).find('div[id="' + controlOld.control_id + '"]').find('.item_jig').each(function(){
                $(this).parent().attr('in_grid', "true");
                addEventEditCls($(this));
              });
            }else{
              addEventEditCls(ui.item);
            }
            if (controlOld) {

              var beforeElmNew = $(ui.item[0]).prev();
              var pos_row_new = 0;
              if (beforeElmNew.length > 0) {
                pos_row_new = parseInt($(beforeElmNew[0]).attr('pos_row'));
              }

              // todo
              if (drag_to_in_grid) {
                // drag control to cell grid
                debugLog('    --> drag control to cell grid');
                controlOld.pos_col = -1;
                var controlNew = TemplateList.getControlDetail(template_id, sectionIdNew, $(parentNodeNew).attr('control_id'));
                var items_grid_class = controlNew.config.items;
                var cell_key = $(parentNodeNew).attr('cell_key');
                var cell = items_grid_class.getCellFromKey(cell_key);

                var ctrsInCell = cell.getControls();
                ctrsInCell.keySort(Controller.getObjectSortFromPosCol());
                var controlsTemp = TemplateList.getArrayControlFromColumn(ctrsInCell, -1);
                $.each(controlsTemp, function () {
                  ctrsInCell.splice(ctrsInCell.indexOfObject(this), 1);
                });
                controlsTemp.splice(pos_row_new, 0, controlOld);
                // update control in pos_col_new
                var arrCtrsTmp = new Array();
                for (var i = 0; i < controlsTemp.length; i++) {
                  var item = controlsTemp[i];
                  item.pos_row = i + 1;
                  arrCtrsTmp.push(item);
                }
                $.each(arrCtrsTmp, function () {
                  $(parentNodeNew).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
                  $(parentNodeNew).find('div[id="' + this.control_id + '"]').attr('section_id', $(parentNodeNew).attr('section_id'));
                });
                ctrsInCell = ctrsInCell.concat(controlsTemp);
                cell.setControls(ctrsInCell);
                return true;
              }

              // same Controller.moveControlToOrtherSection()
              controlOld.pos_col = pos_col_new;
              controlsNew.keySort(Controller.getObjectSortFromPosCol());

              var controlsTemp = TemplateList.getArrayControlFromColumn(controlsNew, pos_col_new);
              $.each(controlsTemp, function () {
                controlsNew.splice(controlsNew.indexOfObject(this), 1);
              });

              controlsTemp.splice(pos_row_new, 0, controlOld);
              // update control in pos_col_new
              var arrCtrsTmp = new Array();
              for (var i = 0; i < controlsTemp.length; i++) {
                var item = controlsTemp[i];
                item.pos_row = i + 1;
                arrCtrsTmp.push(item);
              }
              $.each(arrCtrsTmp, function () {
                $(parentNodeNew).find('div[id="' + this.control_id + '"]').attr('pos_row', this.pos_row.toString());
              });
              controlsNew = controlsNew.concat(controlsTemp);
              sectionNew.controls = controlsNew;
            }
          }
          debugLog(" => DRAG-END: sortable_trash");

        }
      }).disableSelection();

      // set event edit control
      $.each($('.sortableCtr'), function () {
        $.each($(this).find('.item_jig'), function () {
          if ($(this).attr('map_type') && $(this).attr('map_type') === 'grid') return;
          //addEventCheckboxCls($(this));
          addEventEditCls($(this));
        })
      })

    },
    createSection: function (aSection) {

      if (typeof aSection.column_cof == 'undefined') {
        aSection.column_cof = 1;

      } else {
        aSection.column_cof = parseInt(aSection.column_cof);
      }
      if (typeof aSection.collapsible == 'undefined') {
        aSection.collapsible = false;
      } else {
        aSection.collapsible = aSection.collapsible.toString() == 'true' ? true : false;
      }
      if (typeof aSection.sec_class == 'undefined') {
        aSection.sec_class = '';
      }
      if (typeof aSection.sec_attr_name == 'undefined') {
        aSection.sec_attr_name = '';
      }
      if (typeof aSection.sec_attrs == 'undefined') {
        aSection.sec_attrs = '';
      }
      if (typeof aSection.show_header == 'undefined') {
        aSection.show_header = false;
      } else {
        aSection.show_header = aSection.show_header.toString() == 'true' ? true : false;
      }
      if (typeof aSection.show_inner_header == 'undefined') {
        aSection.show_inner_header = false;
      } else {
        aSection.show_inner_header = aSection.show_inner_header.toString() == 'true' ? true : false;
      }
      if (typeof aSection.setting_inner_header == 'undefined') {
        aSection.setting_inner_header = null;
      }
      if (typeof aSection.section_id == 'undefined') {
        aSection.section_id = MainLayout.createNewSectionId();
      }
      if (typeof aSection.secname == 'undefined') {
        aSection.secname = '';
      }
      if (typeof aSection.controls == 'undefined') {
        aSection.controls = new Array();
      }


      MainLayout.elmMainMatrix.append(MainLayout.createHtmlSection(aSection));

      // push section to TemplateList
      var template_id = MainLayout.elmTemplateList.val();
      if (TemplateList.findSectionIdInTemplate(template_id, aSection.section_id) != true) {
        TemplateList.getTemplateDetail(template_id).sections.push(aSection);
      }

      MainLayout.updateCfg();

    },
    createHtmlHeaderSection: function (aSection, aModeSateraitoScript) {
      if (typeof aModeSateraitoScript == 'undefined') {
        aModeSateraitoScript = false;
      }
      var vHtml = '';
      vHtml += '<div class="infoHdrBlk x-panel-header x-unselectable">';
      vHtml += '<table cellpadding="5" cellspacing="0" width="100%">';
      vHtml += '<tbody>';
      vHtml += '<tr><td><b class="secname">' + aSection.secname + '</b></td>';
      vHtml += '<td class="alignright pR5" style="width: 120px;">';
      if (aModeSateraitoScript != true) {
        vHtml += '<img section_id="' + aSection.section_id + '" class="infoHdrEditIc pointer" onclick="MainLayout.getSecDetails(this)" src="' + BASE_URL + '/images/icons/spacer.gif" alt="' + MyLang.getMsg('BTN_EDIT') + '" title="' + MyLang.getMsg('BTN_EDIT') + '">';
        vHtml += '&nbsp;';
        vHtml += '<img section_id="' + aSection.section_id + '" class="infoHdrCopyIc pointer" onclick="MainLayout.copySecDetails(this)" src="' + BASE_URL + '/images/icons/spacer.gif" alt="' + MyLang.getMsg('BTN_MULTI_COPY') + '" title="' + MyLang.getMsg('BTN_MULTI_COPY') + '">';
        vHtml += '&nbsp;';
        vHtml += '<img section_id="' + aSection.section_id + '" class="infoHdrDelIc pointer" onclick="MainLayout.deleteSection(this)" src="' + BASE_URL + '/images/icons/spacer.gif" alt="' + MyLang.getMsg('BTN_DELETE') + '" title="' + MyLang.getMsg('BTN_DELETE') + '">';
        vHtml += '&nbsp;';
        vHtml += '<span section_id="' + aSection.section_id + '" class="moveSection mgl5" onclick="MainLayout.moveUpSection(this)" alt="' + MyLang.getMsg('BTN_MOVE_UP') + '" title="' + MyLang.getMsg('BTN_MOVE_UP') + '">▲</span>';
        vHtml += '&nbsp;';
        vHtml += '<span section_id="' + aSection.section_id + '" class="moveSection" onclick="MainLayout.moveDownSection(this)" alt="' + MyLang.getMsg('BTN_MOVE_DOWN') + '" title="' + MyLang.getMsg('BTN_MOVE_DOWN') + '">▼</span>';
        vHtml += '&nbsp;';
        vHtml += '<div section_id="' + aSection.section_id + '" class="toggle_section mgl5 x-tool toggle-" status="down">&nbsp;</div>';
      } else {
        vHtml += '<div class="x-tool toggle_plus" status="up" id="toggle_' + aSection.section_id + '">&nbsp;</div>';
      }
      vHtml += '</td></tr></tbody></table>';
      vHtml += '</div>';
      return vHtml;
    },
    createHtmlSection: function (aSection) {
      var vHtml = '';

      vHtml += MainLayout.createHtmlHeaderSection(aSection);

      vHtml += MainLayout.createControlsInSection(aSection);

      var elm = document.createElement('div');
      elm.id = aSection.section_id;
      if (aSection.show_header == true) {
        elm.className = 'infoBlk mgt25';
      } else {
        elm.className = 'infoBlk mgt5';
      }

      elm.setAttribute('column_cof', aSection.column_cof.toString());
      elm.setAttribute('sec_class', aSection.sec_class.toString());
      elm.setAttribute('sec_attr_name', aSection.sec_attr_name.toString());
      elm.setAttribute('sec_attrs', aSection.sec_attrs.toString());
      elm.setAttribute('collapsible', aSection.collapsible.toString());
      elm.setAttribute('show_header', aSection.show_header.toString());
      elm.setAttribute('show_inner_header', aSection.show_inner_header.toString());
      if (typeof aSection.setting_inner_header != 'undefined') {
        elm.setAttribute('setting_inner_header', JSON.stringify(aSection.setting_inner_header));
      }
      elm.innerHTML = vHtml;
      return elm;
    },
    hasSelectedTemplate: function () {
      if (TemplateList.data.length == 0) {
        Ext.Msg.show({
          icon: Ext.MessageBox.INFO,
          msg: MyLang.getMsg('MSG_SELECT_TEMPLATE'),
          buttons: Ext.Msg.OK
        });
        return false;
      }
      if (MainLayout.elmTemplateList.val() == '') {
        Ext.Msg.show({
          icon: Ext.MessageBox.INFO,
          msg: MyLang.getMsg('MSG_SELECT_TEMPLATE'),
          buttons: Ext.Msg.OK
        });
        return false;
      }
      return true;
    },
    copySecDetails: function (elm) {

      if (MainLayout.hasSelectedTemplate() == false) {
        return;
      }
      if (elm) {
        var template_id = MainLayout.elmTemplateList.val();
        var section_id = $(elm).attr('section_id');
        var templateDetail = TemplateList.getTemplateDetail(template_id);
        var sectionDetail = TemplateList.getSectionDetail(template_id, section_id);
        var copySectionDetail = clone(sectionDetail);
        copySectionDetail.section_id = MainLayout.createNewSectionId();
        copySectionDetail.secname = copySectionDetail.secname + MyLang.getMsg('MSG_COMP_COPY');
        var controls = copySectionDetail.controls;
        Controller.asyncControls(controls, copySectionDetail.section_id);

        templateDetail.sections.push(copySectionDetail);
        MainLayout.init();
      }
    },
    getSecDetails: function (elm) {
      if (MainLayout.hasSelectedTemplate() == false) {
        return;
      }
      if (elm) {
        // edit section
        var elmSection = $('#' + $(elm).attr('section_id'));
        var objData = {
          section_id: $(elm).attr('section_id'),
          secname: elmSection.find('b.secname').text(),
          column_cof: parseInt(elmSection.attr('column_cof')),
          sec_class: elmSection.attr('sec_class'),
          sec_attr_name: elmSection.attr('sec_attr_name'),
          sec_attrs: elmSection.attr('sec_attrs'),
          collapsible: elmSection.attr('collapsible') == 'true' ? true : false,
          show_header: elmSection.attr('show_header') == 'true' ? true : false,
          show_inner_header: elmSection.attr('show_inner_header') == 'true' ? true : false,
          setting_inner_header: JSON.parse(elmSection.attr('setting_inner_header')),
          mod: 'edit'
        };
        PopupSecDetails.show(objData, function (aJsondata) {
//          console.log(aJsondata)
          MainLayout.updateSection(elmSection, parseInt(elmSection.attr('column_cof')), aJsondata)
        })
      } else {
        // create new section
        var objData = {
          secname: '',
          column_cof: 1,
          show_header: false,
          sec_class: '',
          sec_attr_name: '',
          sec_attrs: '',
          collapsible: false,
          mod: 'new'
        };
        PopupSecDetails.show(objData, function (aJsondata) {
          var section = {
            secname: aJsondata.secname,
            column_cof: aJsondata.column_cof,
            show_header: aJsondata.show_header,
            sec_class: aJsondata.sec_class,
            sec_attr_name: aJsondata.sec_attr_name,
            sec_attrs: aJsondata.sec_attrs,
            collapsible: aJsondata.collapsible,
            show_inner_header: aJsondata.show_inner_header,
            setting_inner_header: aJsondata.setting_inner_header
          };

          MainLayout.createSection(section);
        })

      }
    },
    deleteSection: function (elm) {
      Ext.Msg.show({
        //title: MyLang.getMsg('SATERAITO_BBS'),
        icon: Ext.MessageBox.QUESTION,
        msg: MyLang.getMsg('MSG_DELETE_SECTION'),
        buttons: Ext.Msg.OKCANCEL,
        fn: function (buttonId) {
          if (buttonId == 'ok') {
            // delete now
            var section_id = $(elm).attr('section_id');
            $('#' + section_id).remove();
            var templateDetail = TemplateList.getTemplateDetail(MainLayout.elmTemplateList.val());
            var sections = templateDetail.sections;
            for (var i = 0; i < sections.length; i++) {
              var section = sections[i];
              if (section.section_id == section_id) {
                sections.splice(i, 1);
              }
            }
          }
        }
      });
    },
    updateSection: function (elmSection, pos_col_old, aSection) {
      var sectionDetail = TemplateList.getSectionDetail(MainLayout.elmTemplateList.val(), aSection.section_id);
      sectionDetail.secname = aSection.secname;
      sectionDetail.column_cof = aSection.column_cof;
      sectionDetail.sec_class = aSection.sec_class;
      sectionDetail.sec_attr_name = aSection.sec_attr_name;
      sectionDetail.sec_attrs = aSection.sec_attrs;
      sectionDetail.collapsible = aSection.collapsible;
      sectionDetail.show_header = aSection.show_header;
      sectionDetail.show_inner_header = aSection.show_inner_header;
      sectionDetail.setting_inner_header = aSection.setting_inner_header;
//      console.log(sectionDetail)
      var pos_col_new = parseInt(aSection.column_cof);

      if (pos_col_old != pos_col_new) {
        var controls = sectionDetail.controls;
        controls.keySort(Controller.getObjectSortFromPosCol());
        var idx = 0;
        var objTmp = new Object();
        for (var i_c = 1; i_c < pos_col_new + 1; i_c++) {
          objTmp[i_c] = new Array();
        }
        while (idx < controls.length) {
          for (var i_c = 1; i_c < pos_col_new + 1; i_c++) {
            objTmp[i_c].push('1 row');
            controls[idx].pos_col = i_c;
            controls[idx].pos_row = objTmp[i_c].length;
            idx++;
            if (idx >= controls.length) break;
          }
        }
      }

      if (aSection.show_header == true) {
        elmSection.attr('class', 'infoBlk mgt25');
      } else {
        elmSection.attr('class', 'infoBlk mgt5');
      }

      elmSection.find('b.secname').text(aSection.secname);
      elmSection.attr('column_cof', aSection.column_cof.toString());
      elmSection.attr('sec_class', aSection.sec_class.toString());
      elmSection.attr('sec_attr_name', aSection.sec_attr_name.toString());
      elmSection.attr('sec_attrs', aSection.sec_attrs.toString());
      elmSection.attr('collapsible', aSection.collapsible.toString());
      elmSection.attr('show_header', aSection.show_header.toString());
      elmSection.attr('show_inner_header', aSection.show_inner_header.toString());
      elmSection.attr('setting_inner_header', JSON.stringify(aSection.setting_inner_header));
      MainLayout.updateControlInSection(sectionDetail);
    },
    createHtmlDivControl: function (aSectionId, aControl) {
      var vHtml = "";
      var isMarkMandatory = Controller.isMarkMandatory(aControl);
      var elmCtr = Controller.create(aControl, false, isMarkMandatory);
      var label = Controller.getLabelName(elmCtr);
      var className = Controller.getValueFromAttrName(elmCtr, 'class');
      if (className.search('mandatory') > -1) {
        $(elmCtr).attr('move_trash', 'false');
      } else {
        $(elmCtr).attr('move_trash', 'true');
      }

      if (aControl.map_type_control === 'grid') {
        if (elmCtr.hasAttribute('move_trash')) {
          vHtml += '<div id="' + aControl.control_id + '" map_type="' + aControl.map_type_control + '" section_id="' + aSectionId + '" class="item_jig" pos_row="' + aControl.pos_row + '" move_trash="' + elmCtr.getAttribute('move_trash') + '">';
        } else {
          vHtml += '<div id="' + aControl.control_id + '" map_type="' + aControl.map_type_control + '" section_id="' + aSectionId + '" class="item_jig" pos_row="' + aControl.pos_row + '">';
        }
//        vHtml += '<table gridEditor="true" style="' + aControl.config.attributes.style + '" name="' + aControl.config.attributes.name + '" class="' + aControl.config.attributes.class + '">';
        vHtml += '<table gridEditor="true" style="width:100%" name="' + aControl.config.attributes.name + '" class="' + aControl.config.attributes.class + '">';
        var items = aControl.config.items;
        if (isEmpty(items) === true) {
          // loop
          aControl.config.items = new GridClass({
            maxRow: aControl.config.attributes.max_row,
            maxCol: aControl.config.attributes.max_col
          });

          for (var i = 0; i < aControl.config.attributes.max_row; i++) {
            vHtml += '<tr>';
            for (var j = 0; j < aControl.config.attributes.max_col; j++) {
              vHtml += '<td class="cell-sortable" cell_key="cell_' + i + '-' + j + '">';
              vHtml += '<div class="droptrue" in_grid="true" control_id="' + aControl.control_id + '" section_id="' + aSectionId + '" cell_key="cell_' + i + '-' + j + '">';
              vHtml += '';
              vHtml += '</div>';
              vHtml += '</td>';
            }
            vHtml += '</tr>';
          }
        } else {
          if (items instanceof GridClass) {

          } else {
            aControl.config.items = items = GridUtil.createObjToGridClass(items);
          }
          for (var i = 0; i < items.maxRow; i++) {
            vHtml += '<tr>';
            for (var j = 0; j < items.maxCol; j++) {
              var cell = items.getCell(i, j);
              if (cell) {
                vHtml += '<td class="cell-sortable"';
                if (cell.rowspan > -1) {
                  vHtml += ' rowspan="' + cell.rowspan + '" ';
                }
                if (cell.colspan > -1) {
                  vHtml += ' colspan="' + cell.colspan + '" ';
                }
                vHtml += ' cell_key="cell_' + i + '-' + j + '">';
                vHtml += '<div class="droptrue" in_grid="true" control_id="' + aControl.control_id + '" section_id="' + aSectionId + '" cell_key="cell_' + i + '-' + j + '">';
                vHtml += GridUtil.createControlInCellGrid(cell, aSectionId);
                vHtml += '';
                vHtml += '</div>';
                vHtml += '</td>';
              }
            }
            vHtml += '</tr>';
          }
        }

        vHtml += '</table>';
        vHtml += '</div>';
        return vHtml;
      }
      label = escapeHtml(label);
      if (label.length > 15) {
        label = label.substring(0, 15) + '...'
      }
      if (elmCtr.hasAttribute('move_trash')) {
        vHtml += '<div title="' + label + '" id="' + aControl.control_id + '" map_type="' + aControl.map_type_control + '" section_id="' + aSectionId + '" class="item_jig" pos_row="' + aControl.pos_row + '" move_trash="' + elmCtr.getAttribute('move_trash') + '">';
      } else {
        vHtml += '<div title="' + label + ' id="' + aControl.control_id + '" map_type="' + aControl.map_type_control + '" section_id="' + aSectionId + '" class="item_jig" pos_row="' + aControl.pos_row + '">';
      }

      vHtml += '<table style="width:100%"><tr><td style="width: 10px;min-width: 10px;">';

      vHtml += '<img class="dotLine floatL" src="' + BASE_URL + '/images/icons/spacer.gif" alt="">';
      vHtml += '</td><td width="16">';
      vHtml += '<img class="img_ctr_in_sec" width="20" height="20" src="' + Controller.MapType[aControl.map_type_control].iconUrl + '" />';
      vHtml += '</td><td>';
//      if (label.length > 15) {
//        label = label.substring(0, 15) + '...'
//      }
      vHtml += '<span class="' + className + '" style="white-space: pre;">' + label + '</span>';
      vHtml += '</td><td width="5px">';
      if (className.search('mandatory') > -1 || isMarkMandatory) {
        vHtml += '<span class="validate_require">*</span>';
      }
      vHtml += '</td><td class="pos_import_edit"></td></tr></table>';
      vHtml += '</div>';
      return vHtml;
    },
    createControlsInSection: function (aSection) {

      var vHtml = '';
      vHtml += '<table class="tblCtrls">';


      if (aSection.show_inner_header && typeof aSection.setting_inner_header != 'undefined' && aSection.setting_inner_header) {
        if (typeof aSection.setting_inner_header.v_cfg == 'undefined') {
          aSection.setting_inner_header.v_cfg = new Object();
          aSection.setting_inner_header.v_cfg.inner_header_show_title1 = aSection.show_inner_header != undefined ? aSection.show_inner_header : false;
          aSection.setting_inner_header.v_cfg.inner_header_show_title2 = false;
          aSection.setting_inner_header.v_cfg.title = '';
          aSection.setting_inner_header.v_cfg.width = '';
          aSection.setting_inner_header.v_cfg.align = '';
        }
        if (aSection.setting_inner_header.v_cfg.inner_header_show_title1) {
          vHtml += '<tr>';
          if (aSection.setting_inner_header.v_cfg.inner_header_show_title2) {
            var v_cfg = aSection.setting_inner_header.v_cfg;
            vHtml += '<td style="vertical-align: middle;width:' + v_cfg.width + ';text-align:' + v_cfg.align + '">';
            vHtml += '</td>';
          }
          for (var i = 1; i < aSection.column_cof + 1; i++) {
            var setting = aSection.setting_inner_header[i];
            vHtml += '<td class="inner_header" style="vertical-align: middle;width:' + setting.width + ';text-align:' + setting.align + '">';
            vHtml += '<span>' + setting.title + '</span>';
            vHtml += '</td>';
          }
          vHtml += '</tr>';
        }
      }
      if (typeof aSection.controls == 'undefined') {
        vHtml += '<tr>';

        if (aSection.show_inner_header && typeof aSection.setting_inner_header != 'undefined' && aSection.setting_inner_header) {
          if (typeof aSection.setting_inner_header.v_cfg == 'undefined') {
            aSection.setting_inner_header.v_cfg = new Object();
            aSection.setting_inner_header.v_cfg.inner_header_show_title1 = aSection.show_inner_header != undefined ? aSection.show_inner_header : false;
            aSection.setting_inner_header.v_cfg.inner_header_show_title2 = false;
            aSection.setting_inner_header.v_cfg.title = '';
            aSection.setting_inner_header.v_cfg.width = '';
            aSection.setting_inner_header.v_cfg.align = '';
          }
          if (aSection.setting_inner_header.v_cfg.inner_header_show_title2) {
            var v_cfg = aSection.setting_inner_header.v_cfg;
            vHtml += '<td class="inner_header" style="vertical-align: middle;width:' + v_cfg.width + ';text-align:' + v_cfg.align + '">';
            vHtml += '<span>' + v_cfg.title + '</span>';
            vHtml += '</td>';
          }
        }

        for (var i = 0; i < aSection.column_cof; i++) {
          var w = '50%';
          if (typeof aSection.setting_inner_header != 'undefined' && aSection.setting_inner_header) {
            var setting = aSection.setting_inner_header[i + 1];
            w = setting.width;
          }
          vHtml += '<td style="vertical-align: top;width:' + w + '">';
          vHtml += '<div style="width: 100%;" class="sortableCtr droptrue" section_id="' + aSection.section_id + '" pos_col="1">';
          vHtml += '</div>';
          vHtml += '</td>';
        }
        vHtml += '</tr>';
        vHtml += '</table>';
        return vHtml;
      }

      aSection.controls.keySort(Controller.getObjectSortFromPosCol());
      vHtml += '<tr>';

      if (aSection.show_inner_header && typeof aSection.setting_inner_header != 'undefined' && aSection.setting_inner_header) {
        if (typeof aSection.setting_inner_header.v_cfg == 'undefined') {
          aSection.setting_inner_header.v_cfg = new Object();
          aSection.setting_inner_header.v_cfg.inner_header_show_title1 = aSection.show_inner_header != undefined ? aSection.show_inner_header : false;
          aSection.setting_inner_header.v_cfg.inner_header_show_title2 = false;
          aSection.setting_inner_header.v_cfg.title = '';
          aSection.setting_inner_header.v_cfg.width = '';
          aSection.setting_inner_header.v_cfg.align = '';
        }
        if (aSection.setting_inner_header.v_cfg.inner_header_show_title2) {
          var v_cfg = aSection.setting_inner_header.v_cfg;
          vHtml += '<td class="inner_header" style="vertical-align: middle;width:' + v_cfg.width + ';text-align:' + v_cfg.align + '">';
          vHtml += '<span>' + v_cfg.title + '</span>';
          vHtml += '</td>';
        }
      }

      var objHtml = new Object();
      for (var i_c = 1; i_c < aSection.column_cof + 1; i_c++) {

        var w = '50%';
        if (typeof aSection.setting_inner_header != 'undefined' && aSection.setting_inner_header) {
          var setting = aSection.setting_inner_header[i_c];
          w = setting.width;
        }
        var html = '';
        html += '<td style="vertical-align: top;width:' + w + '">';
        if (i_c <= 2) {
          html += '<div style="width: 100%;min-width: 200px;" class="sortableCtr droptrue" section_id="' + aSection.section_id + '" pos_col="' + i_c + '">';
        } else {
          html += '<div style="width: 100%;min-width: ' + w + '" class="sortableCtr droptrue" section_id="' + aSection.section_id + '" pos_col="' + i_c + '">';
        }
        var controls = TemplateList.getArrayControlFromColumn(aSection.controls, i_c);

        for (var i = 0; i < controls.length; i++) {
          html += MainLayout.createHtmlDivControl(aSection.section_id, controls[i]);
        }
        html += '</div></td>';
        objHtml['html_' + i_c] = html;
      }
      for (var key in objHtml) {
        vHtml += objHtml[key];
      }
      vHtml += '</tr>';

      vHtml += '</table>';

      return vHtml;
    },
    updateControlInSection: function (aSection) {
      debugLog('=> function updateControlInSection()');
      var elmSection = $('#' + aSection.section_id);
      // edit control in section
      elmSection.find('table.tblCtrls').remove();
      var vHtml = '';
      vHtml += MainLayout.createControlsInSection(aSection);
      elmSection.append(vHtml);

      MainLayout.processInitEvents();
    },
    createTemplateFromHtml: function (aJsonData) {
      var elmHtmlTemplate = $(document.createElement('div'));
      elmHtmlTemplate.html(aJsonData.html_template);

      var newTemplate = {};
      newTemplate.id = aJsonData.template_id;
      newTemplate.name = aJsonData.template_name;

      var controls = new Array();

      var radioGroupNames = new Array();
      var checkboxGroupNames = new Array();

      function hasRadioButtonGroup(aParent, radioButtonName) {
        var elms = aParent.find('input:radio[name="' + radioButtonName + '"]');
        if (elms.length > 1) {
          return true;
        }
        return false;
      }

      function hasCheckboxButtonGroup(aParent, radioButtonName) {
        var elms = aParent.find('input:checkbox[name="' + radioButtonName + '"]');
        if (elms.length > 1) {
          return true;
        }
        return false;
      }

      function keyInArray(aKey, aArr) {
        for (var i = 0; i < aArr.length; i++) {
          if (aKey == aArr[i]) {
            return true;
          }
        }
        return false;
      }

      function createControlFromElement(elm, map_type_control, name, tag, pos_row, aCntAttr) {
        var control = new Object();

        control.control_id = MainLayout.createNewControlId();
        if (typeof  pos_row == 'undefined') {

        } else {
          control.pos_row = pos_row;
        }
        control.pos_col = 1;
        control.config = {};
        control.config.attributes = {};
        control.config.attributes.name = name;
        control.map_type_control = map_type_control;
        control.tag = tag;

        var new_attrs = '';
//        for (var i = 0; i < elm.attributes.length; i++) {
//          var att = elm.attributes[i];
//          if (att.nodeName == 'class' || att.nodeName == 'name' || att.nodeName == 'type' || att.nodeName == 'style' || att.nodeName == 'value') {
//
//          } else if (typeof aCntAttr != 'undefined' && att.nodeName in aCntAttr) {
//
//          } else {
//            new_attrs += att.nodeName + '="' + getValFromNodeAttribute(att) + '" ';
//          }
//          control.config.attributes[att.nodeName] = getValFromNodeAttribute(att);
//        }
        $.each(elm.attributes, function() {
          if (this.name == 'class' || this.name == 'name' || this.name == 'type' || this.name == 'style' || this.name == 'value') {

          } else if (typeof aCntAttr != 'undefined' && this.name in aCntAttr) {

          } else {
            if(this.value !== '') {
              new_attrs += this.name + '="' + this.value + '" ';
            }else{
              new_attrs += this.name + ' ';
            }
          }
          control.config.attributes[this.name] = this.value;
        });
        // control.config.attributes.new_attrs = new_attrs.trim().replace(/"/g,'\\\"');
        control.config.attributes.new_attrs = escapeAndEncodeHtml(new_attrs.trim());

        if (elm.hasAttribute('style')) {
          control.config.attributes.style = $(elm).attr('style').toString();
        }

        if (elm.hasAttribute('lblname')) {
          control.config.attributes.lblname = $(elm).attr('lblname');
        } else {
          control.config.attributes.lblname = name;
        }
        control.config.attributes.lblname.showlblname = true;

        if (elm.hasAttribute('class')) {
          control.config.attributes.class = $(elm).attr('class');
        } else {
          control.config.attributes.class = '';
        }
        if (tag == 'select') {
          control.config.items = new Array();
          $(elm).find('option').each(function () {
            control.config.items.push({value: this.value, text: this.text});
          });
        }
        return control;
      }

      var pos_row = 1;
      $.each(elmHtmlTemplate.find('*'), function () {
        if (this.tagName) {
          if (this.tagName == 'INPUT' || this.tagName == 'TEXTAREA' || this.tagName == 'SELECT') {

            var name = '';
            if (this.name) {
              name = this.name;
            }

            var map_type_control;
            var tagName = '';
            if (this.tagName == 'INPUT') {
              map_type_control = this.type;
              tagName = this.tagName.toLowerCase();
              if (map_type_control == 'radio' && name.trim() != '') {
                if (hasRadioButtonGroup(elmHtmlTemplate, name)) {
                  if (keyInArray(name, radioGroupNames) != true) {
                    radioGroupNames.push(name)
                  }
                  return;
                }
              }
              if (map_type_control == 'checkbox' && name.trim() != '') {
                if (hasCheckboxButtonGroup(elmHtmlTemplate, name)) {
                  if (keyInArray(name, checkboxGroupNames) != true) {
                    checkboxGroupNames.push(name)
                  }
                  return;
                }
              }
            } else {
              map_type_control = this.tagName.toLowerCase();
              tagName = this.tagName.toLowerCase();
            }
            var newCtr = createControlFromElement(this, map_type_control, name, tagName, pos_row);
            if (newCtr) {
              if (typeof newCtr.config.attributes.style != 'undefined' && newCtr.config.attributes.style != '') {

              } else {
                newCtr.config.attributes.style = "width:100%";
              }
              controls.push(newCtr);
              pos_row++;
            }
          }
        }
      });

      for (var i = 0; i < radioGroupNames.length; i++) {
        var map_type_control = 'radiogroup';
        var rbGroup = clone(Controller.MapType[map_type_control]);

        var name = radioGroupNames[i];
        var $radios = elmHtmlTemplate.find('input:radio[name="' + name + '"]');
        var items = new Array();

        $.each($radios, function () {
          items.push(createControlFromElement(this, 'radio', name, 'input', undefined, ['value']));
        });

        rbGroup.control_id = MainLayout.createNewControlId();
        rbGroup.map_type_control = map_type_control;
        rbGroup.config.attributes.lblname = name;
        rbGroup.config.attributes.name = name;
        rbGroup.pos_row = pos_row;
        rbGroup.pos_col = 1;
        rbGroup.config.items = clone(items);

        controls.push(rbGroup);
        pos_row++;
      }

      for (var i = 0; i < checkboxGroupNames.length; i++) {
        var map_type_control = 'checkboxgroup';
        var ckGroup = clone(Controller.MapType[map_type_control]);

        var name = checkboxGroupNames[i];
        var $radios = elmHtmlTemplate.find('input:checkbox[name="' + name + '"]');
        var items = new Array();

        $.each($radios, function () {
          items.push(createControlFromElement(this, 'checkbox', name, 'input', undefined, ['value']));
        });

        ckGroup.control_id = MainLayout.createNewControlId();
        ckGroup.map_type_control = map_type_control;
        ckGroup.config.attributes.lblname = name;
        ckGroup.config.attributes.name = name;
        ckGroup.pos_row = pos_row;
        ckGroup.pos_col = 1;
        ckGroup.config.items = clone(items);

        controls.push(ckGroup);
        pos_row++;
      }

      newTemplate.sections = [
        {
          section_id: MainLayout.createNewSectionId(),
          secname: newTemplate.name,
          column_cof: 1,
          controls: controls
        }
      ];

      TemplateList.data.push(newTemplate);
    },
    cleanBuilder: function(){
      TemplateList.data = new Array();
      TrashTemplate.data = new Array();
      RenderLayout.hasInit = false;
    },
    createNewTemplate: function (aTemplate_id, aTemplateName, aTemplateBody, aTemplateBodyForHtmlBuilder, callback) {
      MainLayout.cleanBuilder();
      var obj = new Object();
      obj.template_id = aTemplate_id;
      obj.template_name = aTemplateName;
      obj.html_template = aTemplateBody;

      var elm = $(document.createElement('div'));
      elm.html(aTemplateBody);
      var scripts = elm.find('script[name="sateraito_form_script"]');
      var sateraitoScript = document.createElement("script");
      sateraitoScript.type = "text/javascript";
      sateraitoScript.setAttribute('name', "sateraito_form_script");
      if (scripts.length > 0) {
        sateraitoScript.textContent = $(scripts[0]).text();
      } else {
        sateraitoScript.textContent = MyLang.getMsg('MSG_INPUT_JAVASCRIPT_SECTION_1');
      }
      MainLayout.sateraito_script = sateraitoScript;

      var template_body_for_html_builder = aTemplateBodyForHtmlBuilder;
      if (template_body_for_html_builder && template_body_for_html_builder.trim() != '') {
        var jsonData = null;
        try {
          jsonData = JSON.parse(Base64.decode(template_body_for_html_builder));
        } catch (e) {
          // fix json error
          template_body_for_html_builder = Base64.decode(template_body_for_html_builder).replace(/&quot;/g, '');
          //var matchs = template_body_for_html_builder.match(/new_attrs\\\":\\\"fields=\"([a-zA-Z0-9\s-_+=])*\"\\\"/g);
          var matchs = template_body_for_html_builder.match(/new_attrs\\\":\\\"([^,])*\\\",/g);
          if (matchs){
            for (var i = 0; i < matchs.length; i++) {
              // new_attrs\":\"mandatory_msg="XXXが必須項目です。"  fields="kingaku1 kingaku2"\",
              var match = matchs[i].substring(14, matchs[i].length - 3);
              if (match != "") {
                template_body_for_html_builder = template_body_for_html_builder.replace(match, escapeAndEncodeHtml(match))
              }
            }
          }
          jsonData = JSON.parse(template_body_for_html_builder);
        }
        if (jsonData && jsonData.template_list_json_string) {
          TemplateList.data.push(JSON.parse(jsonData.template_list_json_string));
        }
        if (jsonData && jsonData.trash_template_list_json_string) {
          TrashTemplate.data.push(JSON.parse(jsonData.trash_template_list_json_string));
        }
        if (jsonData && jsonData.sateraito_script_content) {
          sateraitoScript.textContent = jsonData.sateraito_script_content;
          MainLayout.sateraito_script = sateraitoScript;
        }

      } else {
        // create template from html string
        MainLayout.createTemplateFromHtml(obj);
      }
      if (typeof callback == 'function') {
        callback();
      }
    }
  };

  RenderLayout = {
    elmRenderResult: null,
    hasInit: false,
    specialAttrs: [],
    addSpecialAttrs: function(attrName){
      var me = this;
      if($.inArray(attrName, me.specialAttrs) === -1){
        me.specialAttrs.push(attrName);
      }
    },
    fixRenderSpecialAttrs: function(){
      $.each(RenderLayout.specialAttrs, function(){
        var reg = new RegExp(this.toString() + '=\"\"', 'g');
        RefactorCode.result = RefactorCode.result.replace(reg, this.toString());
      });
    },
    init: function () {

      var form = Ext.getCmp('form_panel_renderResult');
      if (form) {
        RenderLayout.afterInit();
        return;
      }
      var vHtml = '';
      vHtml += '<div id="renderResult" class="pwie">';
      vHtml += '<div id="render_date">';
      vHtml += '</div>';
      vHtml += '</div>';
      new Ext.form.FormPanel({
        renderTo: 'form_panel_renderResult_render',
        bodyStyle: 'border:none;background-color:white;',
        layout: 'fit',
        id: 'form_panel_renderResult',
        formId: 'form_renderResult',
        autoScroll: true,
        html: vHtml,
        region: 'center'
      });
      RenderLayout.afterInit();
    },
    afterInit: function () {
      RenderLayout.elmRenderResult = $('#renderResult');
      RenderLayout.renderNow();
      RenderLayout.hasInit = true;
    },
    renderNow: function () {
      RenderLayout.elmRenderResult.html('');
      var template_id = MainLayout.elmTemplateList.val();
      var templateDetail = TemplateList.getTemplateDetail(template_id);
      if (templateDetail) {
        RenderLayout.create(templateDetail, RenderLayout.elmRenderResult);
      }
      RenderLayout.specialAttrs = [];
    },
    create: function (aTemplateDetail, aElmResult, isTabRender) {

      if (typeof isTabRender == 'undefined') {
        isTabRender = true;
      }

      aElmResult.html('');

      var doc_id = 'renderResult';
      aElmResult.append('<div id="template_body_' + doc_id + '"></div>');
      var sections = aTemplateDetail.sections;
      $.each(sections, function () {
        aElmResult.find('div#template_body_' + doc_id).append(RenderLayout.createSecContent(this));
      });

      // update template_body_html_builder_result
      $('#template_body_html_builder_result').html(aElmResult.find('div#template_body_' + doc_id).html());

      if(isTabRender) {
        //
        // クラス「div.section_area」の処理
        //
        aElmResult.find('div#template_body_' + doc_id).find('div.section_area').each(function () {
          var innerHtml = $(this).html();
          var sectionTitle = $(this).attr('section_title');
          if (typeof(sectionTitle) == 'undefined') {
            sectionTitle = '';
          }
          var vHtml = '';
          vHtml += '<div class="section_area_title">';
          vHtml += '<img class="section_arrow_img" src="' + SATERAITO_MY_SITE_URL + '/images/arrowDown.gif" />';
          vHtml += sectionTitle + '</div>';
          vHtml += '<div class="section_show_hide_area" >' + innerHtml + '</div>';
          $(this).html(vHtml);
        });

        aElmResult.find('div#template_body_' + doc_id).find('div.section_area').each(function () {
          var sectionArea = $(this);
          var open = true;
          if ($(sectionArea).attr('display') == 'none') {
            open = false;
          }
          var img = $(sectionArea).find('img.section_arrow_img');
          var showHideArea = $(sectionArea).find('div.section_show_hide_area');
          var display = $(showHideArea).css('display');
          if (open) {
            // 開く
            $(showHideArea).show();
            $(img).attr('src', SATERAITO_MY_SITE_URL + '/images/arrowDown.gif');
          } else {
            // 閉じる
            $(showHideArea).hide();
            $(img).attr('src', SATERAITO_MY_SITE_URL + '/images/arrowRight.gif');
          }
        });
      }

      aElmResult.append(MainLayout.sateraito_script.outerHTML);

      if (isTabRender != true) return;

      // 自分が更新可能なフィールドがある場合
      // 指定フィールドを編集可能状態にする（本文）
      DocDetailWindow.init(doc_id);

      if(typeof(OidMiniMessage) !== 'undefined'){
        OidMiniMessage.clearMessage();
      }
      if(typeof(_OidMiniMessage) !== 'undefined'){
        _OidMiniMessage.clearMessage();
      }
    },
    createHtmlControlInCellGrid: function (cell) {
      var me = this, ctrsCell = cell.getControls(), vHtml = '';
      $.each(ctrsCell, function () {
        vHtml += me.createHtmlFromControl(this);
      });
      return vHtml;
    },
    createHtmlFromControlGrid: function (controlGrid) {
      var me = this, vHtml = '', itemGridClass = controlGrid.config.items;
      var new_attrs = '';
      if (controlGrid.config.attributes.new_attrs && typeof controlGrid.config.attributes.new_attrs != 'undefined') {
        new_attrs = controlGrid.config.attributes.new_attrs;
      }

      vHtml += '<table style="' + controlGrid.config.attributes.style + '" ' + new_attrs + ' name="' + controlGrid.config.attributes.name + '" class="' + controlGrid.config.attributes.class + '">';
      for (var i = 0; i < itemGridClass.maxRow; i++) {
        vHtml += '<tr>';
        for (var j = 0; j < itemGridClass.maxCol; j++) {
          var cell = itemGridClass.getCell(i, j);
          if (cell) {
            vHtml += '<td';
            if (cell.style && cell.style !== '' && cell.style != 'undefined' && cell.style != undefined && cell.style != -1) {
              vHtml += ' style="' + cell.style + '" ';
            }
            if (cell.rowspan > -1) {
              vHtml += ' rowspan="' + cell.rowspan + '" ';
            }
            if (cell.colspan > -1) {
              vHtml += ' colspan="' + cell.colspan + '" ';
            }
            vHtml += ' >';
            vHtml += me.createHtmlControlInCellGrid(cell);
            vHtml += '</td>';
          }
        }
        vHtml += '</tr>';
      }
      vHtml += '</table>';
      return vHtml;
    },
    createHtmlFromControl: function (control) {

      var vHtml = '';
      var is_canvas = false;
      if(control.map_type_control == 'canvas'){
        is_canvas = true;
      }
      if(!is_canvas){
        vHtml += '<table class="detail" cellspacing="0" cellpadding="0">';
        vHtml += '<tr>';
      }

      var isMarkMandatory = Controller.isMarkMandatory(control);
      var elmCtr = Controller.create(control, true, isMarkMandatory);
      var label = Controller.getLabelName(elmCtr);
      if (isMarkMandatory) {
        label += '&nbsp;<font color="red">*</font>';
      }
      var wLabel = Controller.getValueFromAttrName(elmCtr, 'widthlbl');
      if (wLabel.trim() == '') {
        wLabel = '100px';
      }
      var showlabelname = Controller.getShowLabelName(elmCtr);
      elmCtr = Controller.clean(elmCtr);
      if(control.map_type_control == 'radiogroup'){
        $(elmCtr.firstChild).removeAttr('name');
      }
      if(control.map_type_control == 'checkboxgroup'){
        $(elmCtr.firstChild).removeAttr('name');
      }
      if(!is_canvas) {
        if (showlabelname) {
          vHtml += '<td width="' + wLabel + '" class="detail_name">';
          vHtml += label;
          vHtml += '</td>';
          vHtml += '<td width="0%" class="detail_value">';
          if (control.map_type_control != 'label') {
            vHtml += elmCtr.innerHTML;
          } else {
            vHtml += elmCtr.outerHTML;
          }
          vHtml += '</td>';
        } else {
          vHtml += '<td width="100%" class="">';
          if (control.map_type_control != 'label') {
            vHtml += elmCtr.innerHTML;
          } else {

            vHtml += elmCtr.outerHTML;
          }
          vHtml += '</td>';
        }

        vHtml += '</tr>';
        vHtml += '</table>';
      }else{
        vHtml += elmCtr.outerHTML;
      }
      return vHtml;
    },
    createSecContent: function (aSection) {
      var vHtml = '';

      // sec header
      if (typeof aSection.collapsible == 'undefined') {
        aSection.collapsible = false;
      }
      var show_header = false;
      if (aSection.show_header == true || aSection.show_header == 'true' || aSection.show_header == 'True') {
        show_header = true;
      }
      if (aSection.collapsible && show_header) {
//        <div name="company_info_section" class="section_area" section_title="企業情報（自動）" display="none">

        vHtml += '<div class="section_area';

        if(aSection.sec_class) {
          vHtml += ' ' + aSection.sec_class + '"';
        }else{
          vHtml += '"';
        }

        if (aSection.sec_attr_name) {
        vHtml += ' name="' + aSection.sec_attr_name + '"';
        }

        if (aSection.sec_attrs) {
        vHtml += ' ' + unescapeAndDecodeHtml(aSection.sec_attrs) + ' ';
        }

        vHtml += ' section_title="' + aSection.secname + '"';
        vHtml += '>';
//        vHtml += '<div class="section_area_title">';
//        vHtml += '<img class="section_arrow_img" src="' + SATERAITO_MY_SITE_URL + '/images/arrowDown.gif" />';
//        vHtml += aSection.secname + '</div>';
//        vHtml += '<div class="section_show_hide_area" >';
      } else if (aSection.show_header == true || aSection.show_header == 'true' || aSection.show_header == 'True') {
        vHtml += '<div class="';
        if(aSection.sec_class) {
          vHtml += ' ' + aSection.sec_class + '"';
        }else{
          vHtml += '"';
        }
        if (aSection.sec_attr_name) {
          vHtml += ' name="' + aSection.sec_attr_name + '"';
        }
        if (aSection.sec_attrs) {
        vHtml += ' ' + unescapeAndDecodeHtml(aSection.sec_attrs) + ' ';
        }

        vHtml += '>';

        vHtml += '<div class="main_content_title2">' + aSection.secname + '</div>';
      }else{
        vHtml += '<div class="';
        if(aSection.sec_class) {
          vHtml += ' ' + aSection.sec_class + '"';
        }else{
          vHtml += '"';
        }
        if (aSection.sec_attr_name) {
          vHtml += ' name="' + aSection.sec_attr_name + '"';
        }
        if (aSection.sec_attrs) {
        vHtml += ' ' + unescapeAndDecodeHtml(aSection.sec_attrs) + ' ';
        }

        vHtml += '>';
      }
      //sec content
      vHtml += '<table class="detail">';

      //var controls = aSection.controls;
      if (typeof aSection.controls != 'undefined') {
        // sort array
        aSection.controls.keySort({'pos_col': 'asc', 'pos_row': 'asc'});

        var maxRow = 0;
        for (var i_c = 1; i_c < aSection.column_cof + 1; i_c++) {
          var controls = TemplateList.getArrayControlFromColumn(aSection.controls, i_c);
          if (maxRow <= controls.length) maxRow = controls.length;
        }
        var obj_w_cols = new Object();
        if (typeof aSection.show_inner_header != 'undefined' && aSection.show_inner_header && aSection.setting_inner_header && typeof aSection.setting_inner_header.v_cfg != 'undefined' && aSection.setting_inner_header.v_cfg.inner_header_show_title1) {
          var vHtmlTmp = '<tr>';
          if (aSection.setting_inner_header.v_cfg.inner_header_show_title2) {
            var v_cfg = aSection.setting_inner_header.v_cfg;
            vHtmlTmp += '<td  style="vertical-align: middle;width:' + v_cfg.width + ';text-align:' + v_cfg.align + '">';
            vHtmlTmp += '</td>';
          }
          for (var i_c = 1; i_c < aSection.column_cof + 1; i_c++) {
            // var controls = TemplateList.getArrayControlFromColumn(aSection.controls, i_c);
            if (typeof aSection.show_inner_header != 'undefined' && aSection.show_inner_header) {

              var setting = aSection.setting_inner_header[i_c];
              vHtmlTmp += '<td class="inner_header" style="vertical-align: middle;width: ' + setting.width + ';text-align:' + setting.align + '">';
              vHtmlTmp += '<span>' + setting.title + '</span>';
              vHtmlTmp += '</td>';
            }
            obj_w_cols[i_c] = aSection.setting_inner_header[i_c] == undefined ? '0%' : aSection.setting_inner_header[i_c].width;
            if (obj_w_cols[i_c] == '') {
              obj_w_cols[i_c] = '0%';
            }
          }
          vHtmlTmp += '</tr>';
          if (vHtmlTmp != '<tr></tr>') {
            vHtml += vHtmlTmp;
          }
        }

        if (maxRow == 0) {
          if (typeof aSection.show_inner_header != 'undefined' && aSection.show_inner_header && aSection.setting_inner_header && typeof aSection.setting_inner_header.v_cfg != 'undefined' && aSection.setting_inner_header.v_cfg.inner_header_show_title2) {
            var v_cfg = aSection.setting_inner_header.v_cfg;
            vHtml += '<tr>';
            vHtml += '<td rowspan="' + maxRow + '" class="detail_name" style="vertical-align: middle;width:' + v_cfg.width + ';text-align:' + v_cfg.align + '">';
            vHtml += '<span>' + v_cfg.title + '</span>';
            vHtml += '</td>';
            vHtml += '<tr>';
          }
        }

        for (var i_r = 0; i_r < maxRow; i_r++) {
          vHtml += '<tr>';
          if (typeof aSection.show_inner_header != 'undefined' && aSection.show_inner_header && aSection.setting_inner_header && typeof aSection.setting_inner_header.v_cfg != 'undefined' && aSection.setting_inner_header.v_cfg.inner_header_show_title2 && i_r == 0) {
            var v_cfg = aSection.setting_inner_header.v_cfg;
            vHtml += '<td rowspan="' + maxRow + '" class="detail_name" style="vertical-align: middle;width:' + v_cfg.width + ';text-align:' + v_cfg.align + '">';
            vHtml += '<span>' + v_cfg.title + '</span>';
            vHtml += '</td>';
          }

          for (var i_c = 1; i_c < aSection.column_cof + 1; i_c++) {
            var controls = TemplateList.getArrayControlFromColumn(aSection.controls, i_c);
            var width = (100 / aSection.column_cof) + '%';
            if (typeof obj_w_cols[i_c] != 'undefined') {
              width = obj_w_cols[i_c];
            }
            if (aSection.show_inner_header && typeof aSection.show_inner_header != 'undefined') {
              setting = aSection.setting_inner_header[i_c];
              width = setting.width;
            }
            if (typeof controls[i_r] == 'undefined') {
              vHtml += '<td width="' + width + '">';
              vHtml += '</td>';
            } else {
              var is_canvas = false;
              if(controls[i_r].map_type_control == 'canvas'){
                is_canvas = true;
              }
              if(!is_canvas) {
                vHtml += '<td width="' + width + '">';
              }
              if (controls[i_r].map_type_control === 'grid') {
                vHtml += RenderLayout.createHtmlFromControlGrid(controls[i_r]);
              } else {
                vHtml += RenderLayout.createHtmlFromControl(controls[i_r]);
              }
              vHtml += '</td>';
            }
          }
          vHtml += '</tr>';
        }
      }
      vHtml += '</table>';
      vHtml += '</div>';
      return vHtml;
    }
  };

  ViewSource = {
    elmViewSource: null,
    init: function (callback) {
      ViewSource.elmViewSource = $('#viewSource');
      var templateDetail = TemplateList.getTemplateDetail(MainLayout.elmTemplateList.val());
      if (templateDetail) {
        var elm = document.createElement('div');
        RenderLayout.create(templateDetail, $(elm), false);
        ViewSource.viewSource();
      }
      if (typeof  callback == "function") {
        callback();
      }
    },
    viewSource: function () {
      ViewSource.elmViewSource.html('');
      try {
        RefactorCode.init({parent: $('#template_body_html_builder_result')}, false);
//        RefactorCode.result += '<script name="' + MainLayout.sateraito_script.getAttribute('name') + '">\n';
//        RefactorCode.result += MainLayout.sateraito_script.textContent;
//        RefactorCode.result += '\n</script>';
        RenderLayout.fixRenderSpecialAttrs();
        ViewSource.elmViewSource.text(RefactorCode.result);
        // Extend jQuery functionality to support prettify as a prettify() method.
//        jQuery.fn.prettify = function () {
//          this.html(prettyPrintOne(this.html()));
//        };
//        prettyPrint();
//        ViewSource.elmViewSource.prettify();
//        ViewSource.elmViewSource.attr('class', 'prettyprint lang-html linenums=true')
        ViewSource.elmViewSource.attr('class', 'brush: html, js, jscript, javascript, css; toolbar: false;');
        SyntaxHighlighter.highlight(undefined, ViewSource.elmViewSource[0]);
      } catch (e) {
//        console.log(e)
      }
    },
    beforePostMessage: function () {
      var template_id = MainLayout.elmTemplateList.val();
      var templateDetail = TemplateList.getTemplateDetail(template_id);
      var elm = document.createElement('div');
      if (templateDetail) {
        RenderLayout.create(templateDetail, $(elm), false);
        ViewSource.postMessage();
      }
    },
    postMessage: function () {
      // 最終確認メッセージ表示
      Ext.Msg.show({
        icon: Ext.MessageBox.QUESTION,
        msg: MyLang.getMsg('MSG_SAVE_HTML_EDITOR'),
        buttons: Ext.Msg.OKCANCEL,
        fn: function (buttonId) {
          if (buttonId == 'ok') {
            Loading.showMessage(MyLang.getMsg('UPDATING'));
            var templateId = "", template_body = "";

            templateId = MainLayout.elmTemplateList.val();

            RefactorCode.init({parent: $('#template_body_html_builder_result')}, false);
            RenderLayout.fixRenderSpecialAttrs();
            template_body = RefactorCode.result;

            var templateDetail = TemplateList.getTemplateDetail(templateId);
            var templatelist_json_string = '';
            if (templateDetail) {
              templatelist_json_string = JSON.stringify(templateDetail);
            }
            var trashTemplateDetail = TrashTemplate.getTemplateDetail(templateId);
            var trash_templatelist_json_string = '';
            if (trashTemplateDetail) {
              trash_templatelist_json_string = JSON.stringify(trashTemplateDetail);
            }
            var obj = new Object();
            obj.template_body = escapeAndEncodeHtml(template_body);
            obj.template_body_for_html_builder = {
              template_list_json_string: templatelist_json_string,
              trash_template_list_json_string: trash_templatelist_json_string,
              sateraito_script_content: MainLayout.sateraito_script.textContent
            };
            // debugLog(JSON.stringify({template_list_json_string: templatelist_json_string}))

            if (testJsonIsOk(obj)) {
              TemplateList.requestSaveBuilderJsonMemcache(JSON.stringify(obj.template_body_for_html_builder), function (isOk) {
                if (isOk) {
                  top.postMessage(JSON.stringify(obj), "*");
                  window.close();
                } else {
                  window.alert(MyLang.getMsg('MSG_SAVE_HTML_ERROR'));
                }
                Loading.hide();
              });
            } else {
              //json が正しくありません
              window.alert(MyLang.getMsg('MSG_SAVE_UNDEFINED_ERROR'));
              window.close();
              Loading.hide();
            }
          }
        }
      });
    }
  };

  PopupSecDetails = {
    maxCol: 20,
    elm: $('#secDetails'),
    callback: null,
    section: null,
    isEdit: false,
    objectInnerHeaderTmp: {},
    show: function (aObjData, callback) {
      PopupSecDetails.objectInnerHeaderTmp = new Object();
      PopupSecDetails.section = aObjData;
      PopupSecDetails.callback = callback;

      if (aObjData && aObjData.mod == 'edit') {
        PopupSecDetails.isEdit = true;
      }

      var title = '';
      var btnTitle = '';
      if (PopupSecDetails.isEdit == true) {
        title = MyLang.getMsg('MSG_SECTION_EDIT');
        btnTitle = MyLang.getMsg('BTN_SAVE');
      } else {
        title = MyLang.getMsg('BTN_SECTION_ADD_NEW');
        btnTitle = MyLang.getMsg('BTN_ADD');
      }

      PopupSecDetails.id = 'section';
      var win = Ext.getCmp('dlg_' + PopupSecDetails.id);
      if (!win) {
        var buttons = [];
        buttons.push(
          new Ext.Button({
            id: 'btnDlg_' + PopupSecDetails.id,
            text: btnTitle,
            handler: function () {
              PopupSecDetails.save();
            }
          })
        );
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_CANCEL'),
            handler: function () {
              PopupSecDetails.hide();
            }
          })
        );
        win = new Ext.Window({
          id: 'dlg_' + PopupSecDetails.id,
          title: MyLang.getMsg('BTN_SECTION_ADD_NEW'),
          layout: 'fit',
          width: 600,
          height: 400,
          closeAction: 'hide',
          plain: true,
          modal: true,
          items: new Ext.Panel({
            border: false,
            autoScroll: true,
            html: '<div id="' + PopupSecDetails.id + '"></div>'
          }),
          buttons: buttons,
          listeners: {
            afterRender: function () {
              PopupSecDetails.elm = $('#' + PopupSecDetails.id);

              PopupSecDetails.elm.html('');
              PopupSecDetails.elm.append(PopupSecDetails.create);

              PopupSecDetails.createSettingInnerHeader(PopupSecDetails.section.column_cof);
              PopupSecDetails.elm.find('input[name="categoryname"]').val(PopupSecDetails.section.secname);
              PopupSecDetails.elm.find('input[name="categoryname"]').focus();
              PopupSecDetails.elm.find('select[name="column_cof"]').val(PopupSecDetails.section.column_cof);
              PopupSecDetails.elm.find('input[name="sec_class"]').val(PopupSecDetails.section.sec_class);
              PopupSecDetails.elm.find('input[name="sec_attr_name"]').val(PopupSecDetails.section.sec_attr_name);
              PopupSecDetails.elm.find(':input[name="sec_attrs"]').val(unescapeAndDecodeHtml(PopupSecDetails.section.sec_attrs));
              if (typeof PopupSecDetails.section.collapsible == 'undefined') {
                PopupSecDetails.section.collapsible = false;
              }
              PopupSecDetails.elm.find('input[name="collapsible"]').prop('checked', PopupSecDetails.section.collapsible);
              PopupSecDetails.elm.find('input[name="show_header"]').prop('checked', PopupSecDetails.section.show_header);
              if(PopupSecDetails.section.show_header){
                PopupSecDetails.elm.find('input[name="collapsible"]').removeAttr('disabled');
              }

              if (typeof PopupSecDetails.section.show_inner_header == 'undefined') {
                PopupSecDetails.section.show_inner_header = false;
              }

              PopupSecDetails.elm.find('input[name="show_inner_header"]').prop('checked', PopupSecDetails.section.show_inner_header);
              if (PopupSecDetails.isEdit) {
                if (typeof PopupSecDetails.section.setting_inner_header != 'undefined' && PopupSecDetails.section.setting_inner_header) {
                  if (typeof PopupSecDetails.section.setting_inner_header.v_cfg == 'undefined') {
                    PopupSecDetails.section.setting_inner_header.v_cfg = new Object();
                    PopupSecDetails.section.setting_inner_header.v_cfg.inner_header_show_title1 = true;
                    PopupSecDetails.section.setting_inner_header.v_cfg.inner_header_show_title2 = false;
                    PopupSecDetails.section.setting_inner_header.v_cfg.title = '';
                    PopupSecDetails.section.setting_inner_header.v_cfg.width = '';
                    PopupSecDetails.section.setting_inner_header.v_cfg.align = '';
                  }

                  $('#setting_inner_header').html(PopupSecDetails.createHTMLSettingInnerHeader(PopupSecDetails.elm.find('select[name="column_cof"]').val()));

                  PopupSecDetails.elm.find('input[name="inner_header_show_title1"]').prop('checked', PopupSecDetails.section.setting_inner_header.v_cfg.inner_header_show_title1);
                  PopupSecDetails.elm.find('input[name="inner_header_show_title2"]').prop('checked', PopupSecDetails.section.setting_inner_header.v_cfg.inner_header_show_title2);

                  for (var i_c = 1; i_c < PopupSecDetails.section.column_cof + 1; i_c++) {
                    $('#setting_inner_header').find('input[name="inner_header_title_' + i_c + '"]').val(PopupSecDetails.section.setting_inner_header[i_c].title);
                    $('#setting_inner_header').find('input[name="inner_header_width_' + i_c + '"]').val(PopupSecDetails.section.setting_inner_header[i_c].width);
                    $('#setting_inner_header').find('select[name="inner_header_align_' + i_c + '"]').val(PopupSecDetails.section.setting_inner_header[i_c].align);
                  }

                  var v_cfg = PopupSecDetails.section.setting_inner_header.v_cfg;
                  // $('#setting_inner_header').find('input[name="inner_header_show_title"]').val(PopupSecDetails.section.setting_inner_header.v_cfg.title);

                  $('#setting_inner_header').find('input[name="inner_header_title"]').val(v_cfg.title);
                  $('#setting_inner_header').find('input[name="inner_header_width"]').val(v_cfg.width);
                  $('#setting_inner_header').find('select[name="inner_header_align"]').val(v_cfg.align);

                  var column_cof = parseInt(PopupSecDetails.elm.find('select[name="column_cof"]').val());
                  for (var i_c = 1; i_c < column_cof + 1; i_c++) {
                    if (PopupSecDetails.section.setting_inner_header.v_cfg.inner_header_show_title1 == true) {
                      $('#setting_inner_header').find('input[name="inner_header_title_' + i_c + '"]').removeAttr('disabled');
                      $('#setting_inner_header').find('select[name="inner_header_align_' + i_c + '"]').removeAttr('disabled');
                    } else {
                      $('#setting_inner_header').find('input[name="inner_header_title_' + i_c + '"]').attr('disabled', 'disabled');
                      $('#setting_inner_header').find('select[name="inner_header_align_' + i_c + '"]').attr('disabled', 'disabled');
                    }
                  }
                  if (PopupSecDetails.section.setting_inner_header.v_cfg.inner_header_show_title2 == true) {
                    $('#setting_inner_header').find('input[name="inner_header_title"]').removeAttr('disabled');
                    $('#setting_inner_header').find('select[name="inner_header_align"]').removeAttr('disabled');
                  } else {
                    $('#setting_inner_header').find('input[name="inner_header_title"]').attr('disabled', 'disabled');
                    $('#setting_inner_header').find('select[name="inner_header_align"]').attr('disabled', 'disabled');
                  }

                  if (PopupSecDetails.elm.find('input[name="show_inner_header"]').is(':checked')) {
                    $('#setting_inner_header').fadeIn('slow');
                  } else {
                    $('#setting_inner_header').fadeOut('slow');
                  }
                }
              }

              PopupSecDetails.setObjectInnerHeaderTmp();

              PopupSecDetails.elm.find('input[name="show_inner_header"]').change(function () {
                PopupSecDetails.setObjectInnerHeaderTmp();
                if (PopupSecDetails.elm.find('input[name="show_inner_header"]').is(':checked')) {
                  $('#setting_inner_header').html(PopupSecDetails.createHTMLSettingInnerHeader(PopupSecDetails.elm.find('select[name="column_cof"]').val()));
                  $('#setting_inner_header').fadeIn('slow');
                } else {
                  $('#setting_inner_header').html(PopupSecDetails.createHTMLSettingInnerHeader(PopupSecDetails.elm.find('select[name="column_cof"]').val()));
                  $('#setting_inner_header').fadeOut('slow');
                }
                PopupSecDetails.processLoadObjectInnerHeaderTmp();
              });

              PopupSecDetails.elm.find('select[name="column_cof"]').change(function () {
                PopupSecDetails.setObjectInnerHeaderTmp();
                PopupSecDetails.createSettingInnerHeader(parseInt(PopupSecDetails.elm.find('select[name="column_cof"]').val()));
                PopupSecDetails.processLoadObjectInnerHeaderTmp();
              });

              PopupSecDetails.elm.find('input[name="show_header"]').change(function () {
                if ($(this).is(':checked')) {
                  PopupSecDetails.elm.find('input[name="collapsible"]').removeAttr('disabled');
                } else {
                  PopupSecDetails.elm.find('input[name="collapsible"]').attr('disabled', 'disabled');
                }
              })

              PopupToolsCtr.setEventHelpCtr();
            },
            hide: function () {
              PopupSecDetails.hide()
            }
          }
        });
      }
      win.setTitle(title);
      Ext.getCmp('btnDlg_' + PopupSecDetails.id).setText(btnTitle);
      win.show();
    },
    processLoadObjectInnerHeaderTmp: function(){
      var column_cof = parseInt(PopupSecDetails.elm.find('select[name="column_cof"]').val());
      // update values
      PopupSecDetails.elm.find('input[name="inner_header_show_title1"]').prop('checked', PopupSecDetails.objectInnerHeaderTmp.v_cfg.inner_header_show_title1);
      PopupSecDetails.elm.find('input[name="inner_header_show_title2"]').prop('checked', PopupSecDetails.objectInnerHeaderTmp.v_cfg.inner_header_show_title2);
      $('#setting_inner_header').find('input[name="inner_header_title"]').val(PopupSecDetails.objectInnerHeaderTmp.v_cfg.title);
      $('#setting_inner_header').find('input[name="inner_header_width"]').val(PopupSecDetails.objectInnerHeaderTmp.v_cfg.width);
      $('#setting_inner_header').find('select[name="inner_header_align"]').val(PopupSecDetails.objectInnerHeaderTmp.v_cfg.align);

      for (var i_c = 1; i_c < column_cof + 1; i_c++) {
        var inner_header_title_key =  'inner_header_title_' + i_c;
        var inner_header_width_key =  'inner_header_width_' + i_c;
        var inner_header_align_key =  'inner_header_align_' + i_c;
        if (PopupSecDetails.objectInnerHeaderTmp.v_cfg.inner_header_show_title1 == true) {
          $('#setting_inner_header').find('input[name="' + inner_header_title_key + '"]').removeAttr('disabled');
          $('#setting_inner_header').find('select[name="' + inner_header_align_key + '"]').removeAttr('disabled');
        } else {
          $('#setting_inner_header').find('input[name="' + inner_header_title_key + '"]').attr('disabled', 'disabled');
          $('#setting_inner_header').find('select[name="' + inner_header_align_key + '"]').attr('disabled', 'disabled');
        }
        $('#setting_inner_header').find('input[name="' + inner_header_title_key + '"]').val(PopupSecDetails.objectInnerHeaderTmp[inner_header_title_key]);
        $('#setting_inner_header').find('input[name="' + inner_header_width_key + '"]').val(PopupSecDetails.objectInnerHeaderTmp[inner_header_width_key]);
        $('#setting_inner_header').find('select[name="' + inner_header_align_key + '"]').val(PopupSecDetails.objectInnerHeaderTmp[inner_header_align_key]);
      }
      if (PopupSecDetails.objectInnerHeaderTmp.v_cfg.inner_header_show_title2 == true) {
        $('#setting_inner_header').find('input[name="inner_header_title"]').removeAttr('disabled');
        $('#setting_inner_header').find('select[name="inner_header_align"]').removeAttr('disabled');
      } else {
        $('#setting_inner_header').find('input[name="inner_header_title"]').attr('disabled', 'disabled');
        $('#setting_inner_header').find('select[name="inner_header_align"]').attr('disabled', 'disabled');
      }
    },
    setObjectInnerHeaderTmp: function(){
      PopupSecDetails.objectInnerHeaderTmp = new Object();
      PopupSecDetails.objectInnerHeaderTmp.column_cof = parseInt(PopupSecDetails.elm.find('select[name="column_cof"]').val());
      PopupSecDetails.objectInnerHeaderTmp.v_cfg = {};
      PopupSecDetails.objectInnerHeaderTmp.v_cfg.inner_header_show_title1 = PopupSecDetails.elm.find('input[name="inner_header_show_title1"]').is(':checked');
      PopupSecDetails.objectInnerHeaderTmp.v_cfg.inner_header_show_title2 = PopupSecDetails.elm.find('input[name="inner_header_show_title2"]').is(':checked');
      PopupSecDetails.objectInnerHeaderTmp.v_cfg.title = $('#setting_inner_header').find('input[name="inner_header_title"]').val();
      PopupSecDetails.objectInnerHeaderTmp.v_cfg.width = $('#setting_inner_header').find('input[name="inner_header_width"]').val();
      PopupSecDetails.objectInnerHeaderTmp.v_cfg.align = $('#setting_inner_header').find('select[name="inner_header_align"]').val();

      for (var i_c = 1; i_c < PopupSecDetails.objectInnerHeaderTmp.column_cof + 1; i_c++) {        
        var inner_header_title_key =  'inner_header_title_' + i_c;
        var inner_header_width_key =  'inner_header_width_' + i_c;
        var inner_header_align_key =  'inner_header_align_' + i_c;
        PopupSecDetails.objectInnerHeaderTmp[inner_header_title_key] = $('#setting_inner_header').find('input[name="' + inner_header_title_key + '"]').val();
        PopupSecDetails.objectInnerHeaderTmp[inner_header_width_key] = $('#setting_inner_header').find('input[name="' + inner_header_width_key + '"]').val();
        PopupSecDetails.objectInnerHeaderTmp[inner_header_align_key] = $('#setting_inner_header').find('select[name="' + inner_header_align_key + '"]').val();
      }
    },
    clickedShowInnerHeaderTitle1: function (aElm) {
      var column_cof = parseInt(PopupSecDetails.elm.find('select[name="column_cof"]').val());
      for (var i_c = 1; i_c < column_cof + 1; i_c++) {
        if ($(aElm).is(':checked') == true) {
          $('#setting_inner_header').find('input[name="inner_header_title_' + i_c + '"]').removeAttr('disabled');
          $('#setting_inner_header').find('select[name="inner_header_align_' + i_c + '"]').removeAttr('disabled');
        } else {
          $('#setting_inner_header').find('input[name="inner_header_title_' + i_c + '"]').attr('disabled', 'disabled');
          $('#setting_inner_header').find('select[name="inner_header_align_' + i_c + '"]').attr('disabled', 'disabled');
        }
      }
    },
    clickedShowInnerHeaderTitle2: function (aElm) {
      if ($(aElm).is(':checked') == true) {
        $('#setting_inner_header').find('input[name="inner_header_title"]').removeAttr('disabled');
        $('#setting_inner_header').find('select[name="inner_header_align"]').removeAttr('disabled');
      } else {
        $('#setting_inner_header').find('input[name="inner_header_title"]').attr('disabled', 'disabled');
        $('#setting_inner_header').find('select[name="inner_header_align"]').attr('disabled', 'disabled');
      }
    },
    createSettingInnerHeader: function (aCol) {
      $('#setting_inner_header').hide();
      $('#setting_inner_header').html(PopupSecDetails.createHTMLSettingInnerHeader(aCol));

      if (PopupSecDetails.elm.find('input[name="show_inner_header"]').is(':checked')) {
        $('#setting_inner_header').fadeIn('slow');
      } else {
        $('#setting_inner_header').fadeOut('slow');
      }
    },
    createHTMLForShowInnerHeader: function (aCol) {
      var vHtml = '';
      vHtml += '<table class="detail">';

      vHtml += '<tr>';
      vHtml += '<td class="detail_name" style="background-image: none;width: 40px">';
      vHtml += 'No';
      vHtml += '</td>';
      vHtml += '<td class="detail_name" style="background-image: none;">';
      vHtml += '<input onchange="PopupSecDetails.clickedShowInnerHeaderTitle1(this);" type="checkbox" name="inner_header_show_title1" class="inner_header_show_title" checked>';
      vHtml += MyLang.getMsg('LBL_HORIZONTAL_DISPLAY');
      vHtml += '</td>';
      vHtml += '<td class="detail_name" style="background-image: none;width: 120px">';
      vHtml += MyLang.getMsg('LBL_HEADER_EXP');
      vHtml += '</td>';
      vHtml += '<td class="detail_name" style="background-image: none;width: 50px">';
      vHtml += MyLang.getMsg('LBL_HEADER_ARRANGE');
      vHtml += '</td>';
      vHtml += '</tr>';

      for (var i_c = 1; i_c < aCol + 1; i_c++) {
        vHtml += '<tr>';
        vHtml += '<td class="detail_name">';
        vHtml += i_c;
        vHtml += '</td>';
        vHtml += '<td>';
        vHtml += '<input class="inner_header_title textField w97pc" type="text" name="inner_header_title_' + i_c + '">';
        vHtml += '</td>';
        vHtml += '<td>';
        vHtml += '<input class="inner_header_width textField" type="text" name="inner_header_width_' + i_c + '">';
        vHtml += '</td>';
        vHtml += '<td>';
        vHtml += '<select class="inner_header_align" type="text" name="inner_header_align_' + i_c + '">';
        vHtml += '<option value="left">' + MyLang.getMsg('LBL_COL_ALIGN_LEFT') + '</option>';
        vHtml += '<option value="center">' + MyLang.getMsg('LBL_COL_ALIGN_CENTER') + '</option>';
        vHtml += '<option value="right">' + MyLang.getMsg('LBL_COL_ALIGN_RIGHT') + '</option>';
        vHtml += '</select>';
        vHtml += '</td>';
        vHtml += '</tr>';
      }
      vHtml += '</table>';
      return vHtml;
    },
    createHTMLForShowInnerHeader2: function (aCol) {
      var vHtml = '';
      vHtml += '<table class="detail">';

      vHtml += '<tr>';
      vHtml += '<td class="detail_name" style="background-image: none;width: 40px">';
      vHtml += 'No';
      vHtml += '</td>';
      vHtml += '<td class="detail_name" style="background-image: none;">';
      vHtml += '<input onchange="PopupSecDetails.clickedShowInnerHeaderTitle2(this);" type="checkbox" name="inner_header_show_title2" class="inner_header_show_title">';
      vHtml += MyLang.getMsg('LBL_VERTICAL_DISPLAY');
      vHtml += '</td>';
      vHtml += '<td class="detail_name" style="background-image: none;width: 120px">';
      vHtml += MyLang.getMsg('LBL_HEADER_EXP');
      vHtml += '</td>';
      vHtml += '<td class="detail_name" style="background-image: none;width: 50px">';
      vHtml += MyLang.getMsg('LBL_HEADER_ARRANGE');
      vHtml += '</td>';
      vHtml += '</tr>';

      vHtml += '<tr>';
      vHtml += '<td class="detail_name">';
      vHtml += '1';
      vHtml += '</td>';
      vHtml += '<td>';
      vHtml += '<input class="inner_header_title textField w97pc" type="text" name="inner_header_title" disabled>';
      vHtml += '</td>';
      vHtml += '<td>';
      vHtml += '<input class="inner_header_width textField" type="text" name="inner_header_width">';
      vHtml += '</td>';
      vHtml += '<td>';
      vHtml += '<select class="inner_header_align" type="text" name="inner_header_align" disabled>';
      vHtml += '<option value="left">' + MyLang.getMsg('LBL_COL_ALIGN_LEFT') + '</option>';
      vHtml += '<option value="center">' + MyLang.getMsg('LBL_COL_ALIGN_CENTER') + '</option>';
      vHtml += '<option value="right">' + MyLang.getMsg('LBL_COL_ALIGN_RIGHT') + '</option>';
      vHtml += '</select>';
      vHtml += '</td>';
      vHtml += '</tr>';

      vHtml += '</table>';
      return vHtml;
    },
    createHTMLSettingInnerHeader: function (aCol) {
      aCol = parseInt(aCol);
      var vHtml = '';
      vHtml += this.createHTMLForShowInnerHeader(aCol);
      vHtml += this.createHTMLForShowInnerHeader2(aCol);
      return vHtml;
    },
    save: function () {
      var sec_name = PopupSecDetails.elm.find('input[name="categoryname"]').val();
      if (sec_name.trim() == '') {
        Ext.Msg.show({
          icon: Ext.MessageBox.INFO,
          msg: MyLang.getMsg('MSG_SECTION_NAME_REQUIRED'),
          buttons: Ext.Msg.OK
        });
        return;
      }
      var column_cof = parseInt(PopupSecDetails.elm.find('select[name="column_cof"]').val());
      var show_header = PopupSecDetails.elm.find('input[name="show_header"]').is(':checked');
      var sec_class = PopupSecDetails.elm.find('input[name="sec_class"]').val();
      var sec_attr_name = PopupSecDetails.elm.find('input[name="sec_attr_name"]').val();
      var sec_attrs_tmp = PopupSecDetails.elm.find(':input[name="sec_attrs"]').val();
      var sec_attrs_split = sec_attrs_tmp.split(' ');
      var sec_attrs = [];
      $.each(sec_attrs_split, function() {
        var str_split = this.split('=');
        if (str_split[0] == 'class' || str_split[0] == 'name') {
          return;
        }
        sec_attrs.push(this);
      });
      sec_attrs = sec_attrs.join(' ');
      sec_attrs = escapeAndEncodeHtml(sec_attrs.trim());

      var collapsible = PopupSecDetails.elm.find('input[name="collapsible"]').is(':checked');
      var show_inner_header = PopupSecDetails.elm.find('input[name="show_inner_header"]').is(':checked');
      var setting_inner_header = new Object();
      for (var i_c = 1; i_c < column_cof + 1; i_c++) {
        setting_inner_header[i_c] = new Object();
        setting_inner_header[i_c].title = $('#setting_inner_header').find('input[name="inner_header_title_' + i_c + '"]').val() != undefined ? $('#setting_inner_header').find('input[name="inner_header_title_' + i_c + '"]').val() : '';
        setting_inner_header[i_c].width = $('#setting_inner_header').find('input[name="inner_header_width_' + i_c + '"]').val() != undefined ? $('#setting_inner_header').find('input[name="inner_header_width_' + i_c + '"]').val() : '';
        setting_inner_header[i_c].align = $('#setting_inner_header').find('select[name="inner_header_align_' + i_c + '"]').val() != undefined ? $('#setting_inner_header').find('select[name="inner_header_align_' + i_c + '"]').val() : 'left';
      }

      setting_inner_header['v_cfg'] = new Object();
      setting_inner_header['v_cfg'].inner_header_show_title1 = $('#setting_inner_header').find('input[name="inner_header_show_title1"]').is(':checked');
      setting_inner_header['v_cfg'].inner_header_show_title2 = $('#setting_inner_header').find('input[name="inner_header_show_title2"]').is(':checked');
      setting_inner_header['v_cfg'].title = $('#setting_inner_header').find('input[name="inner_header_title"]').val();
      setting_inner_header['v_cfg'].width = $('#setting_inner_header').find('input[name="inner_header_width"]').val();
      setting_inner_header['v_cfg'].align = $('#setting_inner_header').find('select[name="inner_header_align"]').val();

      if (typeof PopupSecDetails.callback == 'function') {
        PopupSecDetails.callback({
          section_id: PopupSecDetails.section.section_id,
          secname: sec_name.trim(),
          column_cof: parseInt(column_cof),
          show_header: show_header,
          sec_class: sec_class,
          sec_attr_name: sec_attr_name,
          sec_attrs: sec_attrs,
          collapsible: collapsible,
          show_inner_header: show_inner_header,
          setting_inner_header: setting_inner_header
        });

      }
      PopupSecDetails.hide();
    },
    hide: function () {
      PopupSecDetails.callback = null;
      PopupSecDetails.section = null;
      PopupSecDetails.isEdit = false;
      var win = Ext.getCmp('dlg_' + PopupSecDetails.id);
      if (win) {
        win.close();
      }
    },
    create: function () {
      var vHtml = '';
      vHtml += '<table cellspacing="0" cellpadding="0" border="0" width="100%" class="mT20">';
      vHtml += '<tbody>';
      vHtml += '<tr>';
      vHtml += '<td class="lbl pL10 f13">' + MyLang.getMsg('LBL_SECTION_NAME') + '</td>';
      vHtml += '</tr>';
      vHtml += '<tr>';
      vHtml += '<td class="alignleft lbl pL10" colspan="2">';
      vHtml += '<input type="text" class="textField f13 p5" style="width:200px" size="40" name="categoryname">';
      vHtml += '<label><input type="checkbox" style="margin-left: 5px" class="f13" name="show_header"> ' + MyLang.getMsg('LBL_SECTION_DISPLAY_NAME') + '&nbsp;</label>';
      vHtml += '<label><input type="checkbox" name="collapsible" disabled>&nbsp;' + MyLang.getMsg('LBL_SECTION_DISPLAY_TOGGLE') + '</label>';
      vHtml += '</td>';
      vHtml += '</tr>';

      vHtml += '<tr>';
      vHtml += '<td class="lbl pL10">';
      vHtml += '<ul class="inline-block">';
      vHtml += '<li><div class="f13 mt5">' + MyLang.getMsg('LBL_SECTION_ATTR_NAME') + '</div>';
      vHtml += '<input type="text" class="textField f13 p5" style="width:200px" size="40" name="sec_attr_name"></li>';
      vHtml += '</ul>';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '<tr>';

      vHtml += '<tr>';
      vHtml += '<td>';

      vHtml += '<table><tr>';
      vHtml += '<td class="lbl pL10">';
      vHtml += '<ul class="inline-block">';
      vHtml += '<li><div class="f13 mt5">' + MyLang.getMsg('LBL_SATERAITO_CLASS') + '</div>';
      vHtml += '<input type="text" class="textField f13 p5" style="width:200px" size="40" name="sec_class"></li>';
      vHtml += '<li>';
      vHtml += '<div class="help_ctr"></div>';
      vHtml += '<p style="display: none;" class="description2">' + MyLang.getMsg('LBL_SECTION_CLASS_EXP') + '</p>';
      vHtml += '</li>';
      vHtml += '</ul>';
      vHtml += '</td>';

      vHtml += '<td class="lbl pL10">';
      vHtml += '<ul class="inline-block">';
      vHtml += '<li><div class="f13 mt5">' + MyLang.getMsg('LBL_SECTION_ATTR') + '</div>';
      vHtml += '<input type="text" class="textField f13 p5" style="width:200px" size="40" name="sec_attrs"></li>';
      vHtml += '</ul>';
      vHtml += '</td>';
      vHtml += '</tr></table>';

      vHtml += '<td>';
      vHtml += '</tr>';

      vHtml += '<tr>';
      vHtml += '<td class="lbl pL10">';
      vHtml += '<ul class="inline-block">';
      vHtml += '<li><div class="f13 mt5">' + MyLang.getMsg('LBL_SECTION_COLUMN') + '</div></li>';
      vHtml += '<li><div class="newSelect p5"><select name="column_cof">';
      for (var i = 1; i < PopupSecDetails.maxCol + 1; i++) {
        if (i == 1) {
          vHtml += '<option value="' + i + '" selected="true">' + i + MyLang.getMsg('LBL_COLUMN') + '</option>';
        } else {
          vHtml += '<option value="' + i + '">' + i + MyLang.getMsg('LBL_COLUMN') + '</option>';
        }
      }
      vHtml += '</select></div></li></ul>';
      vHtml += '</td>';
      vHtml += '</tr>';

      vHtml += '<tr>';
      vHtml += '<td class="lbl pL10">';
      vHtml += '<div class="f13 mt5"><label><input type="checkbox" name="show_inner_header">&nbsp;' + MyLang.getMsg('LBL_DISPLAY_COLUMN') + '</label>';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '<tr>';
      vHtml += '<td class="alignleft lbl" colspan="2">';
      vHtml += '<div id="setting_inner_header"></div>';
      vHtml += '</td>';
      vHtml += '</tr>';

      vHtml += '</tbody>';
      vHtml += '</table>';
      return vHtml;
    }
  };

  PopupToolsCtr = {
    elm: null,
    isEdit: false,
    controlDetail: null,
    callback: null,
    setting_fields: {},
    rbgitems: [],
    bgitems: [],
    boxHtml: '',
    clear: function(){
      this.setting_fields = {};
      this.rbgitems = [];
      this.bgitems = [];
      this.boxHtml = '';
    },
    setEventHelpCtr: function () {
      var process = function(){
        var _this = this, isShow, elmNext;
        if (!$(this).attr('mode_show')) {
          $(this).attr('mode_show', 'false');
        }
        $(this).attr('class', 'help_ctr help_ctr_active');
        $.each($(document).find(".help_ctr"), function () {
          if ($(_this).attr('class') == $(this).attr('class')) {

          } else {
            var elmNext = $(this).next();
            if (elmNext.attr('class') == 'description2') {
              elmNext.hide();
            }
            $(this).attr('class', 'help_ctr');
          }
        });
        isShow = $(this).attr('mode_show') == 'false' ? true : false;
        elmNext = $(this).next();
        if (elmNext.attr('class') == 'description2') {
          if (isShow == true) {
            $(this).next().fadeIn('slow');
          } else {
            $(this).next().hide();
          }
        }
        $(this).attr('mode_show', isShow.toString());
        $(this).attr('class', 'help_ctr');
      };
      $(document).off('click', '.help_ctr');
      $(document).on('click', '.help_ctr', process);
    },
    show: function (aControlDetails, callback) {
      PopupToolsCtr.callback = callback;
      PopupToolsCtr.rbgitems = new Array();
      PopupToolsCtr.boxHtml = '';
      PopupToolsCtr.serial_number_setting = new Object();
      PopupToolsCtr.number_control = 1;
      PopupToolsCtr.id = 'add_tool_control';

      if (aControlDetails != null) {
        PopupToolsCtr.id = 'edit_tool_control';
        PopupToolsCtr.controlDetail = aControlDetails;
        PopupToolsCtr.isEdit = true;
      }

      var title = '';
      var btnTitle = '';
      if (PopupToolsCtr.isEdit == true) {
        title = MyLang.getMsg('LBL_ITEM_EDIT');
        btnTitle = MyLang.getMsg('BTN_SAVE');
      } else {
        title = MyLang.getMsg('LBL_ITEM_ADD_NEW');
        btnTitle = MyLang.getMsg('BTN_ADD');
      }
      var win = Ext.getCmp('dlg_' + PopupToolsCtr.id);
      if (!win) {
        var buttons = [];

        buttons.push(
          new Ext.Button({
            id: 'btnDlg_' + PopupToolsCtr.id,
            text: btnTitle,
            handler: function () {
              PopupToolsCtr.save();
            }
          })
        );
        if (PopupToolsCtr.isEdit == true) {
          buttons.push(
            new Ext.Button({
              id: 'btnDlgCopy_' + PopupToolsCtr.id,
              text: MyLang.getMsg('BTN_MULTI_COPY'),
              handler: function () {
                PopupToolsCtr.save(true);
              }
            })
          );
          buttons.push(
            new Ext.Button({
              id: 'btnDlgDelete_' + PopupToolsCtr.id,
              text: MyLang.getMsg('BTN_DELETE'),
              handler: function () {
                PopupToolsCtr.save(false, true);
              }
            })
          );
        }
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_CANCEL'),
            handler: function () {
              PopupToolsCtr.hide();
            }
          })
        );
        win = new Ext.Window({
          id: 'dlg_' + PopupToolsCtr.id,
          title: title,
          layout: 'fit',
          width: 1050,
          height: 500,
          closeAction: 'hide',
          plain: true,
          modal: true,
          items: new Ext.Panel({
            border: false,
            autoScroll: true,
            html: '<div id="' + PopupToolsCtr.id + '"></div>'
          }),
          buttons: buttons,
          listeners: {
            afterRender: function () {
              PopupToolsCtr.elm = $('#' + PopupToolsCtr.id);

              PopupToolsCtr.elm.html('');

              if (PopupToolsCtr.isEdit == true) {
                PopupToolsCtr.elm.append(PopupToolsCtr.createEditCtrHtml(Controller.MapType[PopupToolsCtr.controlDetail.map_type_control].label));

                $('#new_cf_field').html('');
                $('#new_cf_field').attr('map_type', PopupToolsCtr.controlDetail.map_type_control);
                var mode;
                if (PopupToolsCtr.controlDetail.map_type_control == 'radiogroup') {
                  PopupToolsCtr.rbgitems = clone(PopupToolsCtr.controlDetail.config.items);
                  mode = 'radiogroup';
                }
                if (PopupToolsCtr.controlDetail.map_type_control == 'checkboxgroup') {
                  PopupToolsCtr.rbgitems = clone(PopupToolsCtr.controlDetail.config.items);
                  mode = 'checkboxgroup';
                }
                if (PopupToolsCtr.controlDetail.map_type_control == 'boxgroup') {
                  PopupToolsCtr.bgitems = clone(PopupToolsCtr.controlDetail.config.items);
                  mode = 'boxgroup';
                }
                if (PopupToolsCtr.controlDetail.map_type_control == 'box') {
                  PopupToolsCtr.boxHtml = PopupToolsCtr.controlDetail.config.html;
                  mode = 'box';
                }

                var vHtml = PopupToolsCtr.createHtmlCfgNewField(PopupToolsCtr.controlDetail, PopupToolsCtr.controlDetail.map_type_control, mode);

                $('#new_cf_field').append(vHtml);

              } else {
                PopupToolsCtr.elm.append(PopupToolsCtr.createCustomFieldHtml());
                $('td.fieldType').click(function () {
                  $.each($('table.tblFieldType').find('td.fieldType'), function () {
                    this.className = 'fieldType';
                  });
                  this.className = 'fieldType active';
                  PopupToolsCtr.clear();
                  PopupToolsCtr.controlDetail = clone(Controller.MapType[$(this).attr('map_type')]);

                  $('#new_cf_field').html('');
                  $('#new_cf_field').attr('map_type', $(this).attr('map_type'));
                  var vHtml = PopupToolsCtr.createHtmlCfgNewField(PopupToolsCtr.controlDetail, $(this).attr('map_type'));
                  $('#new_cf_field').append(vHtml);
                  PopupToolsCtr.setEventHelpCtr();

                  var elmColumnSection = PopupToolsCtr.elm.find('select[name="column_section"]');
                  elmColumnSection.empty();
                  var template_id = MainLayout.elmTemplateList.val();
                  var templateDetail = TemplateList.getTemplateDetail(template_id);
                  for (var i = 1; i < templateDetail.sections[0].column_cof + 1; i++) {
                    elmColumnSection.append('<option value="' + i + '">' + i + '</option>');
                  }
                  //column_section
                  PopupToolsCtr.elm.find('select[name="sections"]').change(function () {
                    var section_id = $(this).val();
                    var sectionDetail = TemplateList.getSectionDetail(template_id, section_id);
                    var elmColumnSection = PopupToolsCtr.elm.find('select[name="column_section"]');
                    elmColumnSection.empty();
                    for (var i = 1; i < sectionDetail.column_cof + 1; i++) {
                      elmColumnSection.append('<option value="' + i + '">' + i + '</option>');
                    }
                  });


                  var elmSerialNumberSetting = document.getElementById('serial_number_setting');
                  if (elmSerialNumberSetting) {
                    $(elmSerialNumberSetting).find('select[name="serialNumberDirection"]').change(function () {
                      if ($(this).val() == 'horizontal') {
                        $(elmSerialNumberSetting).find('input[name="serialNumberLength"]').attr('disabled', 'disabled');
                      } else {
                        $(elmSerialNumberSetting).find('input[name="serialNumberLength"]').removeAttr('disabled');
                      }
                    });
                  }

                });
              }

              PopupToolsCtr.setEventHelpCtr();
            },
            hide: function () {
              PopupToolsCtr.hide()
            }
          }
        });
      }
      win.setTitle(title);
      Ext.getCmp('btnDlg_' + PopupToolsCtr.id).setText(btnTitle);
      win.show();
    },
    getConfig: function (map_type, aElm, settingfields, aKeysContinue) {

      function isKeyContinue(aKey) {
        if (typeof  aKeysContinue == 'undefined') {
          return false;
        }
        for (var i = 0; i < aKeysContinue.length; i++) {
          if (aKey == aKeysContinue[i]) {
            return true;
          }
        }
        return false;
      }

      var items = {};
      var attributes = {};
      for (var attrName in settingfields) {
        if (isKeyContinue(attrName) == true) {
          continue;
        }
        if (settingfields[attrName] == true) {
          var value = null;
          switch (attrName) {
            case 'rbgdirection':
              value = aElm.find('select[name="rbGroupDirection"]').val();
              break;
            case 'bgdirection':
              value = aElm.find('select[name="boxGroupDirection"]').val();
              break;
            case 'lblname':
              value = aElm.find('input[name="fldLabel"]').val();
              break;
            case 'showlblname':
              value = aElm.find('input[name="fldShowLabel"]').is(':checked').toString();
              break;
            case 'widthlbl':
              value = aElm.find('input[name="fldWidthLabel"]').val();
              break;
            case 'beforecontent':
              value = aElm.find('input[name="fldBeforeContent"]').val();
              attributes['beforecontentcolor'] = aElm.find('input[name="fldBeforeContentColor"]').val();
              attributes['beforecontentbold'] = aElm.find('input[name="fldBeforeContentBold"]').is(':checked') == true ? 'bold' : 'normal';
              break;
            case 'aftercontent':
              value = aElm.find('input[name="fldAfterContent"]').val();
              attributes['aftercontentcolor'] = aElm.find('input[name="fldAfterContentColor"]').val();
              attributes['aftercontentbold'] = aElm.find('input[name="fldAfterContentBold"]').is(':checked') == true ? 'bold' : 'normal';
              break;
            case 'name':
              value = aElm.find('input[name="fldName"]').val();
              // validate name
              if (value.trim() == '') {
                Ext.Msg.show({
                  icon: Ext.MessageBox.INFO,
                  msg: MyLang.getMsg('MSG_ITEM_NAME_REQUIRED'),
                  buttons: Ext.Msg.OK
                });
                return;
              }
              break;
            case 'style':
              value = aElm.find('input[name="fldStyle"]').val();
              break;
            case 'html':
              if (map_type == 'box') {
                // remove all script
                PopupToolsCtr.boxHtml = escapeAndEncodeHtml(removeAllScriptTags(aElm.find('textarea[name="fldHtml"]').val()));
              }
              break;
            case 'items':
              if (map_type == 'radiogroup') {
                items = new Array();
                for (var i = 0; i < PopupToolsCtr.rbgitems.length; i++) {
                  items.push(PopupToolsCtr.rbgitems[i]);
                }
              } else if (map_type == 'checkboxgroup') {
                items = new Array();
                for (var i = 0; i < PopupToolsCtr.rbgitems.length; i++) {
                  items.push(PopupToolsCtr.rbgitems[i]);
                }
              } else if (map_type == 'boxgroup') {
                items = new Array();
                for (var i = 0; i < PopupToolsCtr.bgitems.length; i++) {
                  items.push(PopupToolsCtr.bgitems[i]);
                }
              } else {
                var jsonObj = [];
                $.each(aElm.find('select[name="fldItems"]').find('option'), function () {
                  jsonObj.push({text: this.text, value: this.value});
                });
                items = jsonObj;
              }
              break;
            case 'value':
              if (map_type == 'textarea') {
                value = escapeAndEncodeHtml(aElm.find('textarea[name="fldValue"]').val());
              } else {
                value = aElm.find('input[name="fldValue"]').val();
              }
              break;
            case 'cols':
              value = aElm.find('input[name="fldCols"]').val();
              break;
            case 'rows':
              value = aElm.find('input[name="fldRows"]').val();
              break;
            case 'disabled':
              value = aElm.find('input[name="fldDisabled"]').is(':checked') == true ? 'disabled' : null;
              break;
            case 'readOnly':
              value = aElm.find('input[name="fldReadOnly"]').is(':checked') == true ? 'readOnly' : null;
              break;
            case 'checked':
              value = aElm.find('input[name="fldChecked"]').is(':checked') == true ? 'checked' : null;
              break;
            case 'multiple':
              value = aElm.find('input[name="fldMultiple"]').is(':checked') == true ? 'multiple' : null;
              break;
            case 'maxlength':
              value = aElm.find('input[name="fldMaxLength"]').val();
              break;
            case 'class':
              value = aElm.find('input[name="fldClassName"]').val();
              break;
            case 'new_attrs':
              value = aElm.find('textarea[name="fldNewAttributes"]').val();
              // value = aElm.find('input[name="fldNewAttributes"]').val();
              //value = value.replace(/"/g,'\\\"').replace(/'/g,'\\\"');
              // todo: fix version 1
              // value = value.replace(/\\/g, '');
              break;
            case 'max_row':
              value = parseInt(aElm.find('input[name="fldMaxRow"]').val());
              break;

            case 'max_col':
              value = parseInt(aElm.find('input[name="fldMaxCol"]').val());
              break;

          }
          if (value != null) {
            attributes[attrName] = value;
          }
        }
      }
      var config = {};
      config.items = items;
      config.attributes = attributes;
      return config;
    },
    save: function (aModeSaveAndCopy, aModeDelete) {
      var map_type = $('#new_cf_field').attr('map_type');
      if (map_type == undefined) {
        Ext.Msg.show({
          icon: Ext.MessageBox.INFO,
          msg: MyLang.getMsg('MSG_ITEM_ADD_REQUIRED'),
          buttons: Ext.Msg.OK
        });
        return;
      }
      var objCtrl = Controller.MapType[map_type];
      var settingfields = objCtrl.config.settingfields;

      var config = PopupToolsCtr.getConfig(map_type, PopupToolsCtr.elm, settingfields);
      var attributes = {};
      if (config.attributes) {
        attributes = config.attributes;
      }
      var items = config.items;
      if (map_type == 'radiogroup') {
        items = clone(PopupToolsCtr.rbgitems);
      }
      if (map_type == 'checkboxgroup') {
        items = clone(PopupToolsCtr.rbgitems);
      }
      if (map_type == 'boxgroup') {
        items = clone(PopupToolsCtr.bgitems);
      }
      var html = '';
      if (map_type == 'box') {
        html = PopupToolsCtr.boxHtml
      }

      if (PopupToolsCtr.isEdit == true) {
        if (typeof PopupToolsCtr.callback == 'function') {
          var callback = PopupToolsCtr.callback;
          if (typeof aModeSaveAndCopy == 'undefined') {
            aModeSaveAndCopy = false;
          }
          if (typeof aModeDelete == 'undefined') {
            aModeDelete = false;
          }
          if (aModeDelete == true) {
            Ext.Msg.show({
              icon: Ext.MessageBox.QUESTION,
              msg: MyLang.getMsg('MSG_ITEM_DELETE'),
              buttons: Ext.Msg.OKCANCEL,
              fn: function (buttonId) {
                if (buttonId == 'ok') {
                  // delete now
                  // var obj = {map_type:map_type,attributes: attributes,items: items, html: html, mode_save_and_copy:aModeSaveAndCopy, mode_delete: aModeDelete};
                  callback({map_type: map_type, attributes: attributes, items: items, html: html, mode_save_and_copy: aModeSaveAndCopy, mode_delete: aModeDelete});
                }
              }
            });
          } else {
            callback({map_type: map_type, attributes: attributes, items: items, html: html, mode_save_and_copy: aModeSaveAndCopy, mode_delete: aModeDelete});
          }
        }
      } else {
        var section_id = PopupToolsCtr.elm.find('select[name="sections"]').val();
        if (map_type == 'serial_number') {
          PopupToolsCtr.serial_number_setting.custom_name = $('#serial_number_setting').find('input[name="serialNumberCustomName"]').val();
          PopupToolsCtr.serial_number_setting.style = $('#serial_number_setting').find('input[name="serialNumberStyle"]').val();
          PopupToolsCtr.serial_number_setting.class = $('#serial_number_setting').find('input[name="serialNumberClassName"]').val();
          PopupToolsCtr.serial_number_setting.direction = $('#serial_number_setting').find('select[name="serialNumberDirection"]').val();
          PopupToolsCtr.serial_number_setting.length = $('#serial_number_setting').find('input[name="serialNumberLength"]').val().trim() == '' ? 1 : parseInt($('#serial_number_setting').find('input[name="serialNumberLength"]').val().trim());
        }
        var elmNumberControl = PopupToolsCtr.elm.find('input[name="fldNumberControl"]');
        var numberControl = 1;
        if (elmNumberControl.length > 0) {
          numberControl = PopupToolsCtr.elm.find('input[name="fldNumberControl"]').val().trim();
          numberControl = numberControl == '' ? 1 : parseInt(numberControl);
        }
        var elmColumnSection = PopupToolsCtr.elm.find('select[name="column_section"]');
        var columnSection = 1;
        if (elmColumnSection.length > 0) {
          columnSection = parseInt(elmColumnSection.val().trim());
        }
        if (typeof PopupToolsCtr.callback == 'function') {
          PopupToolsCtr.callback({section_id: section_id, map_type: map_type, attributes: attributes, items: items, html: html, serial_number_setting: PopupToolsCtr.serial_number_setting, number_control: numberControl, column_section: columnSection});
        }
      }
      PopupToolsCtr.hide();

    },
    hide: function () {
      PopupToolsCtr.callback = null;
      PopupToolsCtr.controlDetail = null;
      PopupToolsCtr.isEdit = false;
      PopupToolsCtr.rbgitems = [];
      PopupToolsCtr.bgitems = [];
      PopupToolsCtr.boxHtml = '';
      var win = Ext.getCmp('dlg_' + PopupToolsCtr.id);
      if (win) {
        win.close();
      }
    },

    addBoxItemsGroup: function (aElm) {
      var aGroupName = PopupToolsCtr.elm.find('input[name="fldName"]').val();

      if (aGroupName.trim() == '') {
        Ext.Msg.show({
          icon: Ext.MessageBox.INFO,
          msg: MyLang.getMsg('MSG_ITEM_NAME_REQUIRED'),
          buttons: Ext.Msg.OK
        });
        PopupToolsCtr.elm.find('input[name="fldName"]').focus();
        return;
      }
      var win = Ext.getCmp('dlg_add_box_item_group');
      if (!win) {
        var buttons = [];
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_ADD'),
            handler: function () {

              var map_type = $('#dlg_add_box_item_group_new_cf_field').attr('map_type');
              if (map_type == undefined) {
                Ext.Msg.show({
                  icon: Ext.MessageBox.INFO,
                  msg: MyLang.getMsg('MSG_ITEM_ADD_REQUIRED'),
                  buttons: Ext.Msg.OK
                });
                return;
              }
              var objCtrl = Controller.MapType[map_type];
              var settingfields = objCtrl.config.settingfields;

              var config = PopupToolsCtr.getConfig(map_type, $('#dlg_add_box_item_group_content'), settingfields);
              var attributes = {};
              if (config.attributes) {
                attributes = config.attributes;
              }
              var items = config.items;

              var newCtr = clone(objCtrl);
              newCtr.control_id = MainLayout.createNewControlId();
              newCtr.config.items = items;
              newCtr.config.attributes = attributes;
              newCtr.map_type_control = map_type;
              PopupToolsCtr.bgitems.push(newCtr);

              var elm = PopupToolsCtr.elm.find('select[name="fldBoxItemsGroup"]');
              var lbl = newCtr.config.attributes.lblname;
              if (lbl && lbl.toString().trim() == '') {
                lbl = newCtr.config.attributes.name;
              }

              elm.append('<option value="' + (PopupToolsCtr.bgitems.length - 1) + '">' + lbl + '</option>');
              win.close();
            }
          })
        );
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_CANCEL'),
            handler: function () {
              win.close();
            }
          })
        );

        var vHtml = '';
        vHtml += '<div style="padding-top: 5px">';
        vHtml += '<div id="dlg_add_box_item_group_content"></div>';
        vHtml += '</div>';

        win = new Ext.Window({
          id: 'dlg_add_box_item_group',
          title: MyLang.getMsg('TITLE_ITEM_ADD'),
          layout: 'fit',
          width: 900,
          height: 500,
          closeAction: 'hide',
          plain: true,
          modal: true,
          items: new Ext.Panel({
            border: false,
            autoScroll: true,
            html: vHtml
          }),
          buttons: buttons,
          listeners: {
            afterRender: function () {
              var okCreateNewFields = ['hidden', 'label', 'time', 'date', 'color', 'email', 'file', 'button', 'submit', 'text', 'textarea', 'radio', 'checkbox', 'select'];

              $('#dlg_add_box_item_group_content').append(PopupToolsCtr.createCustomFieldHtml('dlg_add_box_item_group_new_cf_field', okCreateNewFields));
              $('td.fieldType').click(function () {
                $.each($('table.tblFieldType').find('td.fieldType'), function () {
                  this.className = 'fieldType';
                })
                this.className = 'fieldType active';

                $('#dlg_add_box_item_group_new_cf_field').html('');
                $('#dlg_add_box_item_group_new_cf_field').attr('map_type', $(this).attr('map_type'));
                var parentId = 'dlg_add_box_item_group_new_cf_field';
                var vHtml = PopupToolsCtr.createHtmlCfgNewField(PopupToolsCtr.controlDetail, $(this).attr('map_type'), 'boxgroup', parentId);
                $('#dlg_add_box_item_group_new_cf_field').append(vHtml);
              });
              PopupToolsCtr.setEventHelpCtr();
            },
            hide: function (_this) {
              var win = Ext.getCmp(_this.id);
              if (win) {
                win.close()
              }
            }
          }
        });
      }
      win.show();
    },
    editBoxItemsGroup: function () {
      var elm = PopupToolsCtr.elm.find('select[name="fldBoxItemsGroup"]');
      var selectedValues = elm.val();
      if (selectedValues && selectedValues.length > 0) {
        var itemEdit = PopupToolsCtr.bgitems[selectedValues[0]];
        var aMapType = itemEdit.map_type_control;
        var controlDetails = clone(Controller.MapType[aMapType]);
        controlDetails.config.attributes.lblname = itemEdit.config.attributes.lblname;
        controlDetails.config.attributes.name = itemEdit.config.attributes.name;
        for (var key in itemEdit.config) {
          controlDetails.config[key] = itemEdit.config[key];
        }

        var win = Ext.getCmp('dlg_edit_box_item_group');
        if (!win) {
          var buttons = [];
          buttons.push(
            new Ext.Button({
              text: MyLang.getMsg('BTN_SAVE'),
              handler: function () {
                var objCtrl = Controller.MapType[aMapType];
                var config = PopupToolsCtr.getConfig(aMapType, $("#dlg_edit_box_item_group"), objCtrl.config.settingfields/*, ['name']*/);
                var attributes = {};
                if (config.attributes) {
                  attributes = config.attributes;
                }
                var items = config.items;

                var newCtr = clone(objCtrl);
                newCtr.config.items = items;
                newCtr.config.attributes = attributes;
                //newCtr.config.attributes.name = itemEdit.config.attributes.name;
                newCtr.map_type_control = aMapType;
                PopupToolsCtr.bgitems[selectedValues[0]] = newCtr;

                var elm = PopupToolsCtr.elm.find('select[name="fldBoxItemsGroup"]');
                elm.empty();
                for (var i = 0; i < PopupToolsCtr.bgitems.length; i++) {
                  var control = PopupToolsCtr.bgitems[i];
                  var lbl = control.config.attributes.lblname;
                  if (lbl && lbl.toString().trim() == '') {
                    lbl = control.config.attributes.name;
                  }
                  elm.append('<option value="' + i + '">' + lbl + '</option>');
                }
                win.close();
              }
            })
          );
          buttons.push(
            new Ext.Button({
              text: MyLang.getMsg('BTN_CANCEL'),
              handler: function () {
                win.close();
              }
            })
          );

          var vHtml = '';
          vHtml += '<div style="padding-top: 5px">';
          var parentId = 'dlg_edit_box_item_group';
          vHtml += PopupToolsCtr.createHtmlCfgNewField(controlDetails, aMapType, 'box_group', parentId);
          vHtml += '</div>';

          win = new Ext.Window({
            id: 'dlg_edit_box_item_group',
            title: MyLang.getMsg('TITLE_ITEM_EDIT'),
            layout: 'fit',
            width: 800,
            height: 500,
            closeAction: 'hide',
            plain: true,
            modal: true,
            items: new Ext.Panel({
              border: false,
              autoScroll: true,
              html: vHtml
            }),
            buttons: buttons,
            listeners: {
              afterRender: function () {
                PopupToolsCtr.setEventHelpCtr();
              },
              hide: function (_this) {
                var win = Ext.getCmp(_this.id);
                if (win) {
                  win.close()
                }
              }
            }
          });
        }
        win.show();
      }
      else {
        Ext.Msg.show({
          icon: Ext.MessageBox.INFO,
          msg: MyLang.getMsg('MSG_RAIDO_ITEM_SELECT'),
          buttons: Ext.Msg.OK
        });
      }
    },
    deleteBoxItemGroup: function () {
      var elm = PopupToolsCtr.elm.find('select[name="fldBoxItemsGroup"]');
      var selectedValues = elm.val();
      if (selectedValues) {
        $.each(selectedValues, function () {
          elm.find("option[value='" + this + "']").remove();
          PopupToolsCtr.bgitems.splice(parseInt(this), 1);
        });
        elm.empty();
        for (var i = 0; i < PopupToolsCtr.bgitems.length; i++) {
          var control = PopupToolsCtr.bgitems[i];
          var lbl = control.config.attributes.lblname;
          if (lbl && lbl.toString().trim() == '') {
            lbl = control.config.attributes.name;
          }
          elm.append('<option value="' + i + '">' + lbl + '</option>');
        }
      }
    },

    addItemsGroup: function (aElm) {
      var aGroupName = PopupToolsCtr.elm.find('input[name="fldName"]').val();

      if (aGroupName.trim() == '') {
        Ext.Msg.show({
          icon: Ext.MessageBox.INFO,
          msg: MyLang.getMsg('MSG_ITEM_NAME_REQUIRED'),
          buttons: Ext.Msg.OK
        });
        PopupToolsCtr.elm.find('input[name="fldName"]').focus();
        return;
      }
      var win = Ext.getCmp('dlg_add_item_group');
      if (!win) {
        var aMapType = 'radio';
        var buttons = [];
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_ADD'),
            handler: function () {
              var objCtrl = Controller.MapType[aMapType];
              var config = PopupToolsCtr.getConfig(aMapType, $("#dlg_add_item_group"), objCtrl.config.settingfields, ['name']);
              var attributes = {};
              if (config.attributes) {
                attributes = config.attributes;
              }
              var items = config.items;

              var newCtr = clone(objCtrl);
              newCtr.config.items = items;
              newCtr.config.attributes = attributes;
              newCtr.config.attributes.name = aGroupName;
              newCtr.map_type_control = 'radio';
              PopupToolsCtr.rbgitems.push(newCtr);

              var elm = PopupToolsCtr.elm.find('select[name="fldItemsGroup"]');
              var lbl = newCtr.config.attributes.lblname;
              if (lbl && lbl.toString().trim() == '') {
                lbl = newCtr.config.attributes.name;
              }

              elm.append('<option value="' + (PopupToolsCtr.rbgitems.length - 1) + '">' + lbl + '</option>');
              win.close();
            }
          })
        );
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_CANCEL'),
            handler: function () {
              win.close();
            }
          })
        );

        var vHtml = '';
        vHtml += '<div style="padding-top: 5px">';
        vHtml += PopupToolsCtr.createHtmlCfgNewField(PopupToolsCtr.controlDetail, aMapType, 'radiogroup');
        vHtml += '</div>';

        win = new Ext.Window({
          id: 'dlg_add_item_group',
          title: MyLang.getMsg('TITLE_ITEM_ADD'),
          layout: 'fit',
          width: 850,
          height: 350,
          closeAction: 'hide',
          plain: true,
          modal: true,
          items: new Ext.Panel({
            border: false,
            autoScroll: true,
            html: vHtml
          }),
          buttons: buttons,
          listeners: {
            afterRender: function () {
              PopupToolsCtr.setEventHelpCtr();
            },
            hide: function (_this) {
              var win = Ext.getCmp(_this.id);
              if (win) {
                win.close()
              }
            }
          }
        });
      }
      win.show();
    },
    editItemsGroup: function () {
      var elm = PopupToolsCtr.elm.find('select[name="fldItemsGroup"]');
      var selectedValues = elm.val();
      if (selectedValues && selectedValues.length > 0) {
        var itemEdit = PopupToolsCtr.rbgitems[selectedValues[0]];
        var aMapType = 'radio';
        var controlDetails = clone(Controller.MapType['radio']);
        controlDetails.config.attributes.lblname = itemEdit.config.attributes.lblname;
        controlDetails.config.attributes.name = itemEdit.config.attributes.name;
        for (var key in itemEdit.config) {
          controlDetails.config[key] = itemEdit.config[key];
        }

        var win = Ext.getCmp('dlg_edit_item_group');
        if (!win) {
          var buttons = [];
          buttons.push(
            new Ext.Button({
              text: MyLang.getMsg('BTN_SAVE'),
              handler: function () {
                var objCtrl = Controller.MapType[aMapType];
                var config = PopupToolsCtr.getConfig(aMapType, $("#dlg_edit_item_group"), objCtrl.config.settingfields, ['name']);
                var attributes = {};
                if (config.attributes) {
                  attributes = config.attributes;
                }
                var items = config.items;

                var newCtr = clone(objCtrl);
                newCtr.config.items = items;
                newCtr.config.attributes = attributes;
                newCtr.config.attributes.name = itemEdit.config.attributes.name;
                newCtr.map_type_control = 'radio';
                PopupToolsCtr.rbgitems[selectedValues[0]] = newCtr;

                var elm = PopupToolsCtr.elm.find('select[name="fldItemsGroup"]');
                elm.empty();
                for (var i = 0; i < PopupToolsCtr.rbgitems.length; i++) {
                  var radio = PopupToolsCtr.rbgitems[i];
                  var lbl = radio.config.attributes.lblname;
                  if (lbl && lbl.toString().trim() == '') {
                    lbl = radio.config.attributes.name;
                  }
                  elm.append('<option value="' + i + '">' + lbl + '</option>');
                }
                win.close();
              }
            })
          );
          buttons.push(
            new Ext.Button({
              text: MyLang.getMsg('BTN_CANCEL'),
              handler: function () {
                win.close();
              }
            })
          );

          var aMapType = 'radio';
          var vHtml = '';
          vHtml += '<div style="padding-top: 5px">';
          vHtml += PopupToolsCtr.createHtmlCfgNewField(controlDetails, aMapType, 'radiogroup');
          vHtml += '</div>';

          win = new Ext.Window({
            id: 'dlg_edit_item_group',
            title: MyLang.getMsg('TITLE_ITEM_EDIT'),
            layout: 'fit',
            width: 800,
            height: 350,
            closeAction: 'hide',
            plain: true,
            modal: true,
            items: new Ext.Panel({
              border: false,
              autoScroll: true,
              html: vHtml
            }),
            buttons: buttons,
            listeners: {
              afterRender: function () {
                PopupToolsCtr.setEventHelpCtr();
              },
              hide: function (_this) {
                var win = Ext.getCmp(_this.id);
                if (win) {
                  win.close()
                }
              }
            }
          });
        }
        win.show();
      }
      else {
        Ext.Msg.show({
          icon: Ext.MessageBox.INFO,
          msg: MyLang.getMsg('MSG_RAIDO_ITEM_SELECT'),
          buttons: Ext.Msg.OK
        });
      }
    },
    deleteItemGroup: function () {
      var elm = PopupToolsCtr.elm.find('select[name="fldItemsGroup"]');
      var selectedValues = elm.val();
      if (selectedValues) {
        $.each(selectedValues, function () {
          elm.find("option[value='" + this + "']").remove();
          PopupToolsCtr.rbgitems.splice(parseInt(this), 1);
        });
        elm.empty();
        for (var i = 0; i < PopupToolsCtr.rbgitems.length; i++) {
          var radio = PopupToolsCtr.rbgitems[i];
          var lbl = radio.config.attributes.lblname;
          if (lbl && lbl.toString().trim() == '') {
            lbl = radio.config.attributes.name;
          }
          elm.append('<option value="' + i + '">' + lbl + '</option>');
        }
      }
    },


    addItemsGroupCheckbox: function (aElm) {
      var aGroupName = PopupToolsCtr.elm.find('input[name="fldName"]').val();

      if (aGroupName.trim() == '') {
        Ext.Msg.show({
          icon: Ext.MessageBox.INFO,
          msg: MyLang.getMsg('MSG_ITEM_NAME_REQUIRED'),
          buttons: Ext.Msg.OK
        });
        PopupToolsCtr.elm.find('input[name="fldName"]').focus();
        return;
      }
      var win = Ext.getCmp('dlg_add_item_group');
      if (!win) {
        var aMapType = 'checkbox';
        var buttons = [];
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_ADD'),
            handler: function () {
              var objCtrl = Controller.MapType[aMapType];
              var config = PopupToolsCtr.getConfig(aMapType, $("#dlg_add_item_group"), objCtrl.config.settingfields, ['name']);
              var attributes = {};
              if (config.attributes) {
                attributes = config.attributes;
              }
              var items = config.items;

              var newCtr = clone(objCtrl);
              newCtr.config.items = items;
              newCtr.config.attributes = attributes;
              newCtr.config.attributes.name = aGroupName;
              newCtr.map_type_control = 'checkbox';
              PopupToolsCtr.rbgitems.push(newCtr);

              var elm = PopupToolsCtr.elm.find('select[name="fldItemsGroup"]');
              var lbl = newCtr.config.attributes.lblname;
              if (lbl && lbl.toString().trim() == '') {
                lbl = newCtr.config.attributes.name;
              }

              elm.append('<option value="' + (PopupToolsCtr.rbgitems.length - 1) + '">' + lbl + '</option>');
              win.close();
            }
          })
        );
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_CANCEL'),
            handler: function () {
              win.close();
            }
          })
        );

        var vHtml = '';
        vHtml += '<div style="padding-top: 5px">';
        vHtml += PopupToolsCtr.createHtmlCfgNewField(PopupToolsCtr.controlDetail, aMapType, 'checkboxgroup');
        vHtml += '</div>';

        win = new Ext.Window({
          id: 'dlg_add_item_group',
          title: MyLang.getMsg('TITLE_ITEM_ADD'),
          layout: 'fit',
          width: 850,
          height: 350,
          closeAction: 'hide',
          plain: true,
          modal: true,
          items: new Ext.Panel({
            border: false,
            autoScroll: true,
            html: vHtml
          }),
          buttons: buttons,
          listeners: {
            afterRender: function () {
              PopupToolsCtr.setEventHelpCtr();
            },
            hide: function (_this) {
              var win = Ext.getCmp(_this.id);
              if (win) {
                win.close()
              }
            }
          }
        });
      }
      win.show();
    },
    editItemsGroupCheckbox: function () {
      var elm = PopupToolsCtr.elm.find('select[name="fldItemsGroup"]');
      var selectedValues = elm.val();
      if (selectedValues && selectedValues.length > 0) {
        var itemEdit = PopupToolsCtr.rbgitems[selectedValues[0]];
        var aMapType = 'checkbox';
        var controlDetails = clone(Controller.MapType['checkbox']);
        controlDetails.config.attributes.lblname = itemEdit.config.attributes.lblname;
        controlDetails.config.attributes.name = itemEdit.config.attributes.name;
        for (var key in itemEdit.config) {
          controlDetails.config[key] = itemEdit.config[key];
        }

        var win = Ext.getCmp('dlg_edit_item_group');
        if (!win) {
          var buttons = [];
          buttons.push(
            new Ext.Button({
              text: MyLang.getMsg('BTN_SAVE'),
              handler: function () {
                var objCtrl = Controller.MapType[aMapType];
                var config = PopupToolsCtr.getConfig(aMapType, $("#dlg_edit_item_group"), objCtrl.config.settingfields, ['name']);
                var attributes = {};
                if (config.attributes) {
                  attributes = config.attributes;
                }
                var items = config.items;

                var newCtr = clone(objCtrl);
                newCtr.config.items = items;
                newCtr.config.attributes = attributes;
                newCtr.config.attributes.name = itemEdit.config.attributes.name;
                newCtr.map_type_control = 'checkbox';
                PopupToolsCtr.rbgitems[selectedValues[0]] = newCtr;

                var elm = PopupToolsCtr.elm.find('select[name="fldItemsGroup"]');
                elm.empty();
                for (var i = 0; i < PopupToolsCtr.rbgitems.length; i++) {
                  var radio = PopupToolsCtr.rbgitems[i];
                  var lbl = radio.config.attributes.lblname;
                  if (lbl && lbl.toString().trim() == '') {
                    lbl = radio.config.attributes.name;
                  }
                  elm.append('<option value="' + i + '">' + lbl + '</option>');
                }
                win.close();
              }
            })
          );
          buttons.push(
            new Ext.Button({
              text: MyLang.getMsg('BTN_CANCEL'),
              handler: function () {
                win.close();
              }
            })
          );

          var aMapType = 'radio';
          var vHtml = '';
          vHtml += '<div style="padding-top: 5px">';
          vHtml += PopupToolsCtr.createHtmlCfgNewField(controlDetails, aMapType, 'checkboxgroup');
          vHtml += '</div>';

          win = new Ext.Window({
            id: 'dlg_edit_item_group',
            title: MyLang.getMsg('TITLE_ITEM_EDIT'),
            layout: 'fit',
            width: 800,
            height: 350,
            closeAction: 'hide',
            plain: true,
            modal: true,
            items: new Ext.Panel({
              border: false,
              autoScroll: true,
              html: vHtml
            }),
            buttons: buttons,
            listeners: {
              afterRender: function () {
                PopupToolsCtr.setEventHelpCtr();
              },
              hide: function (_this) {
                var win = Ext.getCmp(_this.id);
                if (win) {
                  win.close()
                }
              }
            }
          });
        }
        win.show();
      }
      else {
        Ext.Msg.show({
          icon: Ext.MessageBox.INFO,
          msg: MyLang.getMsg('MSG_RAIDO_ITEM_SELECT'),
          buttons: Ext.Msg.OK
        });
      }
    },
    deleteItemGroupCheckbox: function () {
      var elm = PopupToolsCtr.elm.find('select[name="fldItemsGroup"]');
      var selectedValues = elm.val();
      if (selectedValues) {
        $.each(selectedValues, function () {
          elm.find("option[value='" + this + "']").remove();
          PopupToolsCtr.rbgitems.splice(parseInt(this), 1);
        });
        elm.empty();
        for (var i = 0; i < PopupToolsCtr.rbgitems.length; i++) {
          var radio = PopupToolsCtr.rbgitems[i];
          var lbl = radio.config.attributes.lblname;
          if (lbl && lbl.toString().trim() == '') {
            lbl = radio.config.attributes.name;
          }
          elm.append('<option value="' + i + '">' + lbl + '</option>');
        }
      }
    },

    addItem: function (aElm) {
      var parentId = $(aElm).attr('parentid');
      if (parentId == 'undefined') {
        parentId = PopupToolsCtr.elm[0].id;
      }
      var win = Ext.getCmp('dlg_add_item');
      if (!win) {
        var buttons = [];
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_ADD'),
            handler: function () {
              var item_name = $('#dlg_add_item_item_name').val();
              var item_value = $('#dlg_add_item_item_value').val();

//              if (item_name.trim() == '') {
//                $("#dlg_add_item_item_name").find('input[name="itemname"]').focus();
//                return;
//              }
//              if(item_value.trim() == ''){
//                $( "#dlg_add_item_item_value").find('input[name="itemvalue"]').focus();
//                return;
//              }
              var elm = $('#' + parentId).find('select[name="fldItems"]');
              elm.append('<option value="' + item_value + '">' + item_name + '</option>');
              win.close();
            }
          })
        );
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_CANCEL'),
            handler: function () {
              win.close();
            }
          })
        );
        var vHtml = '';
        vHtml += '<div style="display: block" class="p10">';
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel" nowrap="">' + MyLang.getMsg('LBL_LIST_ITEM_DISPLAY_VALUE') + '</td>';
        vHtml += '<td width="200">';
        vHtml += '<input type="text" id="dlg_add_item_item_name" name="itemname" class="textField p5">';
        vHtml += '</td></tr>';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel" nowrap="">' + MyLang.getMsg('LBL_LIST_ITEM_SUBMIT_VALUE') + '</td>';
        vHtml += '<td width="200">';
        vHtml += '<input type="text" id="dlg_add_item_item_value" name="itemvalue" class="textField p5">';
        vHtml += '</td></tr>';
        vHtml += '</table>';
        vHtml += '</div>';
        vHtml += '</div>';

        win = new Ext.Window({
          id: 'dlg_add_item',
          title: MyLang.getMsg('TITLE_LIST_ITEM'),
          layout: 'fit',
          width: 450,
          height: 200,
          closeAction: 'hide',
          plain: true,
          modal: true,
          items: new Ext.Panel({
            border: false,
            autoScroll: true,
            html: vHtml
          }),
          buttons: buttons,
          listeners: {
            afterRender: function () {
              PopupToolsCtr.setEventHelpCtr();
            },
            hide: function (_this) {
              var win = Ext.getCmp(_this.id);
              if (win) {
                win.close()
              }
            }
          }
        });
      }
      win.show();
    },
    editItem: function (aElm) {
      var parentId = $(aElm).attr('parentid');
      if (parentId == 'undefined') {
        parentId = PopupToolsCtr.elm[0].id;
      }
      var elm = $('#' + parentId).find('select[name="fldItems"]');
      //var selectedValues = elm.val();
      var options = $('#' + parentId).find('select[name="fldItems"] option');
      var idx = options.index(options.filter(":selected"));
      if (idx > -1) {
        var itemEdit = options[idx];

        var win = Ext.getCmp('dlg_edit_item');
        if (!win) {
          var buttons = [];
          buttons.push(
            new Ext.Button({
              text: MyLang.getMsg('BTN_SAVE'),
              handler: function () {
                var item_name = $('#dlg_add_item_item_name').val()
                var item_value = $('#dlg_add_item_item_value').val();

                if (item_name.trim() == '') {
                  $("#dlg_add_item_item_name").find('input[name="itemname"]').focus();
                  return;
                }
//                if(item_value.trim() == ''){
//                  $( "#dlg_add_item_item_value").find('input[name="itemvalue"]').focus();
//                  return;
//                }
                itemEdit.text = item_name;
                itemEdit.value = item_value;
                win.close();
              }
            })
          );
          buttons.push(
            new Ext.Button({
              text: MyLang.getMsg('BTN_CANCEL'),
              handler: function () {
                win.close();
              }
            })
          );
          var vHtml = '';
          vHtml += '<div style="display: block" class="p10">';
          vHtml += '<div>';
          vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
          vHtml += '<tr>';
          vHtml += '<td class="newLabel" nowrap="">' + MyLang.getMsg('LBL_LIST_ITEM_DISPLAY_VALUE') + '</td>';
          vHtml += '<td width="200">';
          vHtml += '<input type="text" id="dlg_add_item_item_name" name="itemname" class="textField p5" value="' + itemEdit.text + '">';
          vHtml += '</td></tr>';
          vHtml += '<tr>';
          vHtml += '<td class="newLabel" nowrap="">' + MyLang.getMsg('LBL_LIST_ITEM_SUBMIT_VALUE') + '</td>';
          vHtml += '<td width="200">';
          vHtml += '<input type="text" id="dlg_add_item_item_value" name="itemvalue" class="textField p5" value="' + itemEdit.value + '">';
          vHtml += '</td></tr>';
          vHtml += '</table>';
          vHtml += '</div>';
          vHtml += '</div>';

          win = new Ext.Window({
            id: 'dlg_edit_item',
            title: MyLang.getMsg('TITLE_LIST_ITEM'),
            layout: 'fit',
            width: 450,
            height: 200,
            closeAction: 'hide',
            plain: true,
            modal: true,
            items: new Ext.Panel({
              border: false,
              autoScroll: true,
              html: vHtml
            }),
            buttons: buttons,
            listeners: {
              afterRender: function () {
                PopupToolsCtr.setEventHelpCtr();
              },
              hide: function (_this) {
                var win = Ext.getCmp(_this.id);
                if (win) {
                  win.close()
                }
              }
            }
          });
        }
        win.show();
      }
      else {
        Ext.Msg.show({
          icon: Ext.MessageBox.INFO,
          msg: MyLang.getMsg('MSG_RAIDO_ITEM_SELECT'),
          buttons: Ext.Msg.OK
        });
      }
    },
    deleteItem: function (aElm) {
      var parentId = $(aElm).attr('parentid');
      if (parentId == 'undefined') {
        parentId = PopupToolsCtr.elm[0].id;
      }
      var elm = $('#' + parentId).find('select[name="fldItems"]');
      var selectedValues = elm.val();
      if (selectedValues) {
        $.each(selectedValues, function () {
          elm.find("option[value='" + this + "']").remove();
        });
      }
    },

    getFieldValue: function (aControlDetail, aAttrName) {
      var value = '';
      if (aControlDetail != null) {
        if (aControlDetail.config.attributes[aAttrName]) {
          value = aControlDetail.config.attributes[aAttrName];
        }
      }
      return value;
    },
    createHtmlSerialNumber: function (aControlDetail) {
      var vHtml = '';
      if (aControlDetail.map_type_control == 'serial_number' || aControlDetail.tag == 'serial_number') {
        vHtml += '<div id="serial_number_setting">';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';

        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_TITLE') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<input type="text" name="serialNumberCustomName" class="textField p5" value="">';
        vHtml += '</td>';
        vHtml += '<td><p class="description">';
        vHtml += MyLang.getMsg('LBL_SERIAL_TITLE');
        vHtml += '</p></td>';
        vHtml += '</tr>';

        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_DISPLAY_DIRECTION') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<div class="newSelect p5" style="margin-bottom: 5px;width: 125px;">';
        vHtml += '<select name="serialNumberDirection" class="p5">';
        vHtml += '<option value="horizontal" selected>' + MyLang.getMsg('LBL_HORIZONTAL_DIRECTION') + '</option>';
        vHtml += '<option value="vertical">' + MyLang.getMsg('LBL_VERTICAL_DIRECTION') + '</option>';
        vHtml += '</select>';
        vHtml += '</div>';
        vHtml += '</td>';
        vHtml += '</tr>';

        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_NUMBER_COPY') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<input type="number" name="serialNumberLength" class="textField p5" style="width: 50px;" disabled value="1">';
        vHtml += '</td>';
        vHtml += '<td>';
        vHtml += '<p class="description">' + MyLang.getMsg('LBL_NUMBER_COPY_EXP') + '</p>';
        vHtml += '</td>';
        vHtml += '</tr>';

        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_ITEM_STYLE') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<input type="text" name="serialNumberStyle" class="textField p5" value="">';
        vHtml += '</td>';
        vHtml += '<td>';
        vHtml += '<table border="0" cellspacing="0" cellpadding="0"><tbody><tr><td>';
        vHtml += '<div class="help_ctr"></div>';
        vHtml += '<p style="display: none;" class="description2">' + MyLang.getMsg('LBL_STYLE_SAMPLE_EXP') + '</p>';
        vHtml += '</td><td>';
        vHtml += '</td></tr></tbody></table>';
        vHtml += '</td>';
        vHtml += '</tr>';

        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_SATERAITO_CLASS') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<input type="text" name="serialNumberClassName" class="textField p5" value="detail_name arrowRight">';
        vHtml += '</td>';
        vHtml += '<td>';
        vHtml += '<table border="0" cellspacing="0" cellpadding="0"><tbody><tr><td>';
        vHtml += '<div class="help_ctr"></div>';
        vHtml += '<div style="display: none;" class="description2">' + MyLang.getMsg('LBL_SATERAITO_CLASS_EXP') + '</div>';
        vHtml += '</td><td>';
        vHtml += '<p class="description">' + MyLang.getMsg('LBL_SATERAITO_CLASS_EXP_2') + '</p>';
        vHtml += '</td></tr></tbody></table>';
        vHtml += '</td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }
      return vHtml;
    },
    changeContentColor: function (aElm) {
      var span = $(aElm).next().next();
      span.css('color', $(aElm).val())
    },
    changeContentBold: function (aElm) {
      var span = $(aElm).next();
      span.css('fontWeight', $(aElm).is(':checked') == true ? 'bold' : 'normal');
    },
    createHtmlCfgNewField: function (aControlDetail, aMapType, aMode, aParentId) {
      if (typeof aMode == 'undefined') {
        aMode = '';
      }
      if (typeof aParentId == 'undefined') {
        aParentId = PopupToolsCtr.elm.id;
      }
      var settingfields = Controller.MapType[aMapType].config.settingfields;


      var vHtml = '';

      if (settingfields.lblname && settingfields.lblname == true) {
        // labelDiv
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_TITLE') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<table><tr><td>';
//        var str_style = '';
//        if (settingfields.widthlbl && settingfields.widthlbl == true) {
//          str_style = "width:160px";
//        }
        vHtml += '<input type="text" name="fldLabel" style="margin-left: -2px" class="textField p5" value="';
        if (aMapType == 'radio' && aMode == 'radiogroup') {
          vHtml += PopupToolsCtr.getFieldValue(aControlDetail, 'lblname')
        } else if (aMapType == 'checkbox' && aMode == 'checkboxgroup') {
          vHtml += PopupToolsCtr.getFieldValue(aControlDetail, 'lblname')
        } else if (aMapType != 'boxgroup' && aMode == 'boxgroup') {

        } else {
          vHtml += PopupToolsCtr.getFieldValue(aControlDetail, 'lblname')
        }
        vHtml += '">';
        vHtml += '</td>';
        if (settingfields.widthlbl && settingfields.widthlbl == true) {
          vHtml += '<td>';
          vHtml += '<span> ' + MyLang.getMsg('LBL_ITEM_WIDTH') + '</span>';
          vHtml += '</td><td>';
          vHtml += '<input type="text" style="width:35px " name="fldWidthLabel" class="textField p5" value="';
          if (aMapType == 'radio' && aMode == 'radiogroup') {
            vHtml += PopupToolsCtr.getFieldValue(aControlDetail, 'widthlbl')
          } else if (aMapType == 'checkbox' && aMode == 'checkboxgroup') {
            vHtml += PopupToolsCtr.getFieldValue(aControlDetail, 'widthlbl')
          } else if (aMapType != 'boxgroup' && aMode == 'boxgroup') {

          } else {
            vHtml += PopupToolsCtr.getFieldValue(aControlDetail, 'widthlbl')
          }
          vHtml += '"></td>';
        }
        vHtml += '</tr></table>';
        vHtml += '</td>';
        vHtml += '<td>';
//        if(aMapType == 'radio' && aMode == 'radiogroup'){
//
//        }
//        else
        if (settingfields.showlblname && settingfields.showlblname == true) {
          vHtml += '<label class="newlabel" style="margin-left: 5px;">';
          if (aControlDetail
            && ( aControlDetail.config.attributes.showlblname == undefined
              || typeof (aControlDetail.config.attributes.showlblname) == 'undefined'
              || aControlDetail.config.attributes.showlblname == 'true'
              || aControlDetail.config.attributes.showlblname == true)
            ) {
            vHtml += '<input type="checkbox" name="fldShowLabel" class="p5" checked>';
          } else {
            vHtml += '<input type="checkbox" name="fldShowLabel" class="p5">';
          }
          vHtml += '<span style="position: relative;top: -3px;">' + MyLang.getMsg('LBL_ITEM_NAME_DISPLAY') + '</span></label>';
        }
        vHtml += '</td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (aMapType == 'radio' && aMode == 'radiogroup') {

      } else if (aMapType == 'checkbox' && aMode == 'checkboxgroup') {

      } else {
        if (settingfields.name && settingfields.name == true) {
          // nameDiv
          vHtml += '<div>';
          vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
          vHtml += '<tr>';
          vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('MSG_ITEM_NAME') + '</td>';
          vHtml += '<td width="150">';
          if (aMapType != 'boxgroup' && aMode == 'boxgroup') {
            vHtml += '<input type="text" name="fldName" class="textField p5">';
          } else {
            vHtml += '<input type="text" name="fldName" class="textField p5" value="' + PopupToolsCtr.getFieldValue(aControlDetail, 'name') + '">';
          }
          vHtml += '</td><td><p class="description">' + MyLang.getMsg('NAME_DESC') + '</p>';

          vHtml += '</td></tr>';
          vHtml += '</table>';
          vHtml += '</div>';
        }
      }

      if (PopupToolsCtr.isEdit == true) {
      }
      else {
        // sectionDiv
        if (aMapType == 'radio' && aMode == 'radiogroup' || aMode == 'boxgroup') {
          vHtml += '<div style="display: none">';
        } else if (aMapType == 'checkbox' && aMode == 'checkboxgroup' || aMode == 'boxgroup') {
          vHtml += '<div style="display: none">';
        } else {
          vHtml += '<div>';
        }
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_ITEM_SECTION') + '</td>';
        vHtml += '<td width="100">';
        vHtml += '<div class="newSelect p5" style="margin-bottom: 5px;width: 100px;">';
        vHtml += '<select name="sections">';

        var templateDetail = TemplateList.getTemplateDetail(MainLayout.elmTemplateList.val());

        for (var i = 0; i < templateDetail.sections.length; i++) {
          var section = templateDetail.sections[i];
          vHtml += '<option value="' + section.section_id + '">' + section.secname + '</option>';
        }

        vHtml += '</select>';
        vHtml += '</div>';
        vHtml += '</td>';
        vHtml += '<td>';
        vHtml += MyLang.getMsg('LBL_ITEM_SECTION_COLUMN');
        vHtml += '</td>';
        vHtml += '<td>';

        vHtml += '<div class="newSelect p5" style="margin-bottom: 5px;width: 50px;">';
        vHtml += '<select name="column_section">';
        vHtml += '</select>';
        vHtml += '</div>';

        vHtml += '</td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (aMapType == 'radio' && aMode == 'radiogroup') {
      } else if (aMapType == 'checkbox' && aMode == 'checkboxgroup') {
      }
      else if (settingfields.style && settingfields.style == true) {
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_ITEM_STYLE') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<input type="text" name="fldStyle" class="textField p5" value="';
        vHtml += PopupToolsCtr.getFieldValue(aControlDetail, 'style');
        vHtml += '">';
        vHtml += '</td>';
        vHtml += '<td>';
        vHtml += '<table border="0" cellspacing="0" cellpadding="0"><tbody><tr><td>';
        vHtml += '<div class="help_ctr"></div>';
        vHtml += '<p style="display: none;" class="description2">' + MyLang.getMsg('LBL_STYLE_SAMPLE_EXP') + '</p>';
        vHtml += '</td><td>';
        vHtml += '</td></tr></tbody></table>';
        vHtml += '</td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (settingfields.class && settingfields.class == true) {
        // classNameDetails
        vHtml += '<div id="classNameDetails">';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_SATERAITO_CLASS') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<input type="text" name="fldClassName" class="textField p5" value="' + PopupToolsCtr.getFieldValue(aControlDetail, 'class') + '"></td>';
        vHtml += '<td>';
        vHtml += '<table border = "0" cellspacing = "0" cellpadding = "0" ><tr><td>';
        vHtml += '<div class="help_ctr"></div>';
        vHtml += '<div style="display: none;" class="description2">' + MyLang.getMsg('LBL_SATERAITO_CLASS_EXP') + '</div>'
        vHtml += '</td>';
        vHtml += '<td>';
        vHtml += '<p class="description">' + MyLang.getMsg('LBL_SATERAITO_CLASS_EXP_2') + '</p>';
        vHtml += '</td></tr></table>';
        vHtml += '</td></tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (settingfields.new_attrs && settingfields.new_attrs == true) {
        // classNameDetails
        vHtml += '<div id="classNameDetails">';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_SATERAITO_ATTRS') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<textarea class="textField" rows="2" cols="1"  style="width: 230px;resize:both;" name="fldNewAttributes">' + escapeHtml(unescapeAndDecodeHtml(PopupToolsCtr.getFieldValue(aControlDetail, 'new_attrs'))) + '</textarea></td>';
        // vHtml += '<input type="text" name="fldNewAttributes" class="textField p5" value="' + unescapeAndDecodeHtml(PopupToolsCtr.getFieldValue(aControlDetail, 'new_attrs')).replace(/\"/g,"&quot;") + '"></td>';
        vHtml += '<td>';
        vHtml += '<table border = "0" cellspacing = "0" cellpadding = "0" ><tr><td>';
        vHtml += '<div class="help_ctr"></div>';
        vHtml += '<div style="display: none;" class="description2"><p>' + MyLang.getMsg('LBL_SATERAITO_ATTRS_EXP') + '</p></div>';
        vHtml += '</td>';
        vHtml += '<td>';
        vHtml += '<p class="description">' + MyLang.getMsg('LBL_SATERAITO_CLASS_EXP_2') + '</p>';
        vHtml += '</td></tr></table>';
        vHtml += '</td></tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (aMapType == 'radio' && aMode == 'radiogroup') {
      } else if (aMapType == 'checkbox' && aMode == 'checkboxgroup') {
      }
      else if (settingfields.html && settingfields.html == true) {
        vHtml += '<div">';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_HTML_CODE') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<textarea rows="3" cols="1" name="fldHtml" class="textField p5" style="width: 230px;height: 100px;resize:both;" >';
        if (aControlDetail) {
          vHtml += aControlDetail.config.html == undefined ? '' : escapeHtml(unescapeAndDecodeHtml(aControlDetail.config.html));
        }

        vHtml += '</textarea>';
        vHtml += '</td>';
        //vHtml += '<td>';
        //vHtml += '<p>html description</p>';
        //vHtml += '</td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (settingfields.rbgdirection && settingfields.rbgdirection == true) {
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_DISPLAY_DIRECTION') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<div class="newSelect p5" style="margin-bottom: 5px;width: 125px;">';
        if (aControlDetail != null) {
          vHtml += '<select name="rbGroupDirection" class="p5">';
          if (typeof aControlDetail.config.attributes.rbgdirection == 'undefined') {
            aControlDetail.config.attributes.rbgdirection = 'horizontal';
          }
          if (aControlDetail.config.attributes.rbgdirection == 'horizontal') {
            vHtml += '<option value="horizontal" selected>' + MyLang.getMsg('LBL_HORIZONTAL_DIRECTION') + '</option>';
            vHtml += '<option value="vertical">' + MyLang.getMsg('LBL_VERTICAL_DIRECTION') + '</option>';
          } else {
            vHtml += '<option value="horizontal">' + MyLang.getMsg('LBL_HORIZONTAL_DIRECTION') + '</option>';
            vHtml += '<option value="vertical" selected>' + MyLang.getMsg('LBL_VERTICAL_DIRECTION') + '</option>';
          }
          vHtml += '</select>';
        } else {
          vHtml += '<select name="rbGroupDirection" class="p5"><option value="horizontal" selected>' + MyLang.getMsg('LBL_HORIZONTAL_DIRECTION') + '</option><option value="vertical">' + MyLang.getMsg('LBL_VERTICAL_DIRECTION') + '</option></select>';
        }
        vHtml += '</div>';
        vHtml += '</td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }
      if (settingfields.rbgitems && settingfields.rbgitems == true && aMapType == 'radiogroup' ) {
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_LIST_RADIO_BTN') + '</td>';
        vHtml += '<td width="150">';
        if (aControlDetail != null) {
          vHtml += '<select name="fldItemsGroup" class="p5" style="margin-bottom: 5px;margin-right: 5px;height: 80px;width: 156px" multiple>';
          for (var i = 0; i < aControlDetail.config.items.length; i++) {
            var item = aControlDetail.config.items[i];
            var lbl = item.config.attributes.lblname;
            if (lbl && lbl.toString().trim() == '') {
              lbl = item.config.attributes.name;
            }
            vHtml += '<option value="' + i + '">' + lbl + '</option>';
          }
          vHtml += '</select>';
        } else {
          vHtml += '<select name="fldItemsGroup" class="p5" style="margin-left: 0px;margin-right: 5px;height: 50px;width: 156px" multiple></select>';
        }
        vHtml += '</td>';
        vHtml += '<td style="vertical-align: middle">';
        vHtml += '<input onclick="PopupToolsCtr.addItemsGroup(this);" type="button" name="fldItemsGroupAdd" class="newgraybtn w40" value="' + MyLang.getMsg('BTN_ADD') + '"/>';
        vHtml += '<input onclick="PopupToolsCtr.editItemsGroup(this);" type="button" name="fldItemsGroupEdit" class="newgraybtn w40" value="' + MyLang.getMsg('BTN_EDIT') + '"/>';
        vHtml += '<input onclick="PopupToolsCtr.deleteItemGroup(this);" type="button" name="fldItemsGroupDel" class="newgraybtn w40" value="' + MyLang.getMsg('BTN_DELETE') + '"/>';
        vHtml += '</td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';

      }

      if (settingfields.rbgitems && settingfields.rbgitems == true  && aMapType == 'checkboxgroup') {
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_LIST_CHECKBOX_BTN') + '</td>';
        vHtml += '<td width="150">';
        if (aControlDetail != null) {
          vHtml += '<select name="fldItemsGroup" class="p5" style="margin-bottom: 5px;margin-right: 5px;height: 80px;width: 156px" multiple>';
          for (var i = 0; i < aControlDetail.config.items.length; i++) {
            var item = aControlDetail.config.items[i];
            var lbl = item.config.attributes.lblname;
            if (lbl && lbl.toString().trim() == '') {
              lbl = item.config.attributes.name;
            }
            vHtml += '<option value="' + i + '">' + lbl + '</option>';
          }
          vHtml += '</select>';
        } else {
          vHtml += '<select name="fldItemsGroup" class="p5" style="margin-left: 0px;margin-right: 5px;height: 50px;width: 156px" multiple></select>';
        }
        vHtml += '</td>';
        vHtml += '<td style="vertical-align: middle">';
        vHtml += '<input onclick="PopupToolsCtr.addItemsGroupCheckbox(this);" type="button" name="fldItemsGroupAdd" class="newgraybtn w40" value="' + MyLang.getMsg('BTN_ADD') + '"/>';
        vHtml += '<input onclick="PopupToolsCtr.editItemsGroupCheckbox(this);" type="button" name="fldItemsGroupEdit" class="newgraybtn w40" value="' + MyLang.getMsg('BTN_EDIT') + '"/>';
        vHtml += '<input onclick="PopupToolsCtr.deleteItemGroupCheckbox(this);" type="button" name="fldItemsGroupDel" class="newgraybtn w40" value="' + MyLang.getMsg('BTN_DELETE') + '"/>';
        vHtml += '</td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';

      }
      if (settingfields.bgdirection && settingfields.bgdirection == true) {
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_DISPLAY_DIRECTION') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<div class="newSelect p5" style="margin-bottom: 5px;width: 125px;">';
        if (aControlDetail != null) {
          vHtml += '<select name="boxGroupDirection" class="p5">';
          if (typeof aControlDetail.config.attributes.bgdirection == 'undefined') {
            aControlDetail.config.attributes.bgdirection = 'horizontal';
          }
          if (aControlDetail.config.attributes.bgdirection == 'horizontal') {
            vHtml += '<option value="horizontal" selected>' + MyLang.getMsg('LBL_HORIZONTAL_DIRECTION') + '</option>';
            vHtml += '<option value="vertical">' + MyLang.getMsg('LBL_VERTICAL_DIRECTION') + '</option>';
          } else {
            vHtml += '<option value="horizontal">' + MyLang.getMsg('LBL_HORIZONTAL_DIRECTION') + '</option>';
            vHtml += '<option value="vertical" selected>' + MyLang.getMsg('LBL_VERTICAL_DIRECTION') + '</option>';
          }
          vHtml += '</select>';
        } else {
          vHtml += '<select name="boxGroupDirection" class="p5"><option value="horizontal" selected>' + MyLang.getMsg('LBL_HORIZONTAL_DIRECTION') + '</option><option value="vertical">' + MyLang.getMsg('LBL_VERTICAL_DIRECTION') + '</option></select>';
        }
        vHtml += '</div>';
        vHtml += '</td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }
      if (settingfields.bgitems && settingfields.bgitems == true) {

        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_GROUP_HTML_ITEM') + '</td>';
        vHtml += '<td width="150">';
        if (aControlDetail != null) {
          vHtml += '<select name="fldBoxItemsGroup" class="p5" style="margin-bottom: 5px;margin-right: 5px;height: 80px;width: 156px" multiple>';
          for (var i = 0; i < aControlDetail.config.items.length; i++) {
            var item = aControlDetail.config.items[i];
            var lbl = item.config.attributes.lblname;
            if (lbl && lbl.toString().trim() == '') {
              lbl = item.config.attributes.name;
            }
            vHtml += '<option value="' + i + '">' + lbl + '</option>';
          }
          vHtml += '</select>';
        } else {
          vHtml += '<select name="fldBoxItemsGroup" class="p5" style="margin-left: 0px;margin-right: 5px;height: 50px;width: 156px" multiple></select>';
        }
        vHtml += '</td>';
        vHtml += '<td style="vertical-align: middle">';
        vHtml += '<input onclick="PopupToolsCtr.addBoxItemsGroup(this);" type="button" name="fldItemsGroupAdd" class="newgraybtn w40" value="' + MyLang.getMsg('BTN_ADD') + '"/>';
        vHtml += '<input onclick="PopupToolsCtr.editBoxItemsGroup(this);" type="button" name="fldItemsGroupEdit" class="newgraybtn w40" value="' + MyLang.getMsg('BTN_EDIT') + '"/>';
        vHtml += '<input onclick="PopupToolsCtr.deleteBoxItemGroup(this);" type="button" name="fldItemsGroupDel" class="newgraybtn w40" value="' + MyLang.getMsg('BTN_DELETE') + '"/>';
        vHtml += '</td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';

      }

      if (settingfields.items && settingfields.items == true) {
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_GROUP_HTML_ITEM') + '</td>';
        vHtml += '<td width="150">';
        if (aControlDetail != null) {
          vHtml += '<select name="fldItems" class="p5" style="margin-bottom: 5px;margin-right: 5px;height: 80px;width: 156px" multiple>';
          if (aMapType == 'select' && aMode == 'boxgroup') {
            // no something
          } else {
            for (var i = 0; i < aControlDetail.config.items.length; i++) {
              var item = aControlDetail.config.items[i];
              vHtml += '<option value="' + item.value + '">' + item.text + '</option>';
            }
          }
          vHtml += '</select>';
        } else {
          vHtml += '<select name="fldItems" class="p5" style="margin-left: 0px;margin-right: 5px;height: 50px;width: 156px" multiple></select>';
        }
        vHtml += '</td>';
        vHtml += '<td style="vertical-align: middle">';
        vHtml += '<input onclick="PopupToolsCtr.addItem(this);" parentid="' + aParentId + '" type="button" name="fldItems+" class="newgraybtn w40" value="' + MyLang.getMsg('BTN_ADD') + '"/>';
        vHtml += '<input onclick="PopupToolsCtr.editItem(this);" parentid="' + aParentId + '" type="button" name="fldItemsEdit" class="newgraybtn w40" value="' + MyLang.getMsg('BTN_EDIT') + '"/>';
        vHtml += '<input onclick="PopupToolsCtr.deleteItem(this);" parentid="' + aParentId + '" type="button" name="fldItems-" class="newgraybtn w40" value="' + MyLang.getMsg('BTN_DELETE') + '"/>';

        vHtml += '</td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (settingfields.value && settingfields.value == true) {
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_ITEM_INIT_VALUE') + '</td>';
        vHtml += '<td width="150">';
        if (aControlDetail.map_type_control == 'textarea' || aControlDetail.tag == 'textarea') {
          vHtml += '<textarea type="text" name="fldValue" class="p5" cols="1" rows="3" style="width: 230px;height: 100px;resize:both;" >' + escapeHtml(unescapeAndDecodeHtml(PopupToolsCtr.getFieldValue(aControlDetail, 'value'))) + '</textarea></td>';
        } else {
          vHtml += '<input type="text" name="fldValue" class="textField p5" value="' + PopupToolsCtr.getFieldValue(aControlDetail, 'value') + '"></td>';
        }
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (settingfields.maxlength && settingfields.maxlength == true) {
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_ITEM_LENGTH') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<input type="number" name="fldMaxLength" class="textField p5" value="' + PopupToolsCtr.getFieldValue(aControlDetail, 'maxlength') + '"></td>';
        vHtml += '<td><p class="description">' + MyLang.getMsg('LBL_ITEM_LENGTH_EXP') + '</p></td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (settingfields.cols && settingfields.cols == true) {
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_ITEM_NUMBER_CHARS') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<input type="number" name="fldCols" class="textField p5" value="' + PopupToolsCtr.getFieldValue(aControlDetail, 'cols') + '"></td>';
        vHtml += '<td><p class="description">' + MyLang.getMsg('LBL_ITEM_NUMBER_CHARS_EXP') + '</p></td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (settingfields.rows && settingfields.rows == true) {
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_ITEM_NUMBER_LINES') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<input type="number" name="fldRows" class="textField p5" value="' + PopupToolsCtr.getFieldValue(aControlDetail, 'rows') + '"></td>';
        vHtml += '<td><p class="description">' + MyLang.getMsg('LBL_ITEM_LENGTH_EXP') + '</p></td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (settingfields.readOnly && settingfields.readOnly == true) {
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_ITEM_READONLY') + '</td>';
        vHtml += '<td width="150">';
        if (aControlDetail != null && aControlDetail.config.attributes.readOnly == 'readOnly') {
          vHtml += '<input type="checkbox" name="fldReadOnly" class="p5" checked>';
        } else {
          vHtml += '<input type="checkbox" name="fldReadOnly" class="p5">';
        }
        vHtml += '&nbsp;&nbsp;&nbsp;<span class="description">' + MyLang.getMsg('LBL_ITEM_READONLY_EXP') + '</span>';
        vHtml += '</td></tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (settingfields.disabled && settingfields.disabled == true) {
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_ITEM_DISABLE') + '</td>';
        vHtml += '<td width="150">';
        if (aControlDetail != null && aControlDetail.config.attributes.disabled == 'disabled') {
          vHtml += '<input type="checkbox" name="fldDisabled" class="p5" checked>';
        } else {
          vHtml += '<input type="checkbox" name="fldDisabled" class="p5">';
        }
        vHtml += '&nbsp;&nbsp;&nbsp;<span class="description">' + MyLang.getMsg('LBL_ITEM_DISABLE_EXP') + '</span>';
        vHtml += '</td></tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (settingfields.checked && settingfields.checked == true) {
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_ITEM_CHEKED_ON') + '</td>';
        vHtml += '<td width="150">';
        if (aControlDetail != null && aControlDetail.config.attributes.checked == 'checked') {
          vHtml += '<input type="checkbox" name="fldChecked" class="p5" checked></td>';
        } else {
          vHtml += '<input type="checkbox" name="fldChecked" class="p5"></td>';
        }
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (settingfields.multiple && settingfields.multiple == true) {
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_ITEM_MULTI_SELECT') + '</td>';
        vHtml += '<td width="150">';
        if (aControlDetail != null && aControlDetail.config.attributes.multiple == 'multiple') {
          vHtml += '<input type="checkbox" name="fldMultiple" class="p5" checked></td>';
        } else {
          vHtml += '<input type="checkbox" name="fldMultiple" class="p5"></td>';
        }
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (aMapType == 'radio' && aMode == 'radiogroup') {
      }
      else if (aMapType == 'checkbox' && aMode == 'checkboxgroup') {
      }
      else if (settingfields.beforecontent && settingfields.beforecontent == true) {
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_ITEM_BEFORE_EXP') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<input type="text" name="fldBeforeContent" class="textField p5" value="';
        vHtml += PopupToolsCtr.getFieldValue(aControlDetail, 'beforecontent');
        vHtml += '">';
        vHtml += '</td>';

        var color = PopupToolsCtr.getFieldValue(aControlDetail, 'beforecontentcolor');
        var bold = PopupToolsCtr.getFieldValue(aControlDetail, 'beforecontentbold');
        vHtml += '<td>';
        vHtml += '<input onchange="PopupToolsCtr.changeContentColor(this);" type="color" name="fldBeforeContentColor" class="fldBeforeContentColor mgl5" value="' + color + '">';
        vHtml += '<input onchange="PopupToolsCtr.changeContentBold(this);" type="checkbox" name="fldBeforeContentBold" class="fldBeforeContentBold mgl5" ';
        if (bold == 'bold') {
          vHtml += 'checked';
        }
        vHtml += '>';
        vHtml += '<span class="fldBeforeContentSample mgl5" style="color:' + color + ';font-weight:' + bold + '">' + MyLang.getMsg('LBL_ITEM_BOLDER_ON') + '</span>';
        vHtml += '</td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (aMapType == 'radio' && aMode == 'radiogroup') {
      }
      else if (aMapType == 'checkbox' && aMode == 'checkboxgroup') {
      }
      else if (settingfields.aftercontent && settingfields.aftercontent == true) {
        vHtml += '<div>';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_ITEM_AFFTER_EXP') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<input type="text" name="fldAfterContent" class="textField p5" value="';
        vHtml += PopupToolsCtr.getFieldValue(aControlDetail, 'aftercontent');
        vHtml += '">';
        vHtml += '</td>';

        var color = PopupToolsCtr.getFieldValue(aControlDetail, 'aftercontentcolor');
        var bold = PopupToolsCtr.getFieldValue(aControlDetail, 'aftercontentbold');
        vHtml += '<td>';
        vHtml += '<input onchange="PopupToolsCtr.changeContentColor(this);" type="color" name="fldAfterContentColor" class="fldAfterContentColor mgl5" value="' + color + '">';
        vHtml += '<input onchange="PopupToolsCtr.changeContentBold(this);" type="checkbox" name="fldAfterContentBold" class="fldAfterContentBold mgl5" ';
        if (bold == 'bold') {
          vHtml += 'checked';
        }
        vHtml += '>';
        vHtml += '<span class="fldAfterContentSample mgl5" style="color:' + color + ';font-weight:' + bold + '">' + MyLang.getMsg('LBL_ITEM_BOLDER_ON') + '</span>';
        vHtml += '</td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      // number_control
      if (PopupToolsCtr.isEdit == true || aMapType === 'grid') {
      } else if (aMapType == 'radio' && aMode == 'radiogroup') {
      } else if (aMapType == 'checkbox' && aMode == 'checkboxgroup') {
      }
      else if (aMapType != 'boxgroup' && aMode == 'boxgroup') {
      }
      else if (aControlDetail.map_type_control == 'serial_number' || aControlDetail.tag == 'serial_number') {

      }
      else {
        vHtml += '<div">';
        vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
        vHtml += '<tr>';
        vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_ITEM_MULTI_COPY') + '</td>';
        vHtml += '<td width="150">';
        vHtml += '<input type="number" name="fldNumberControl" class="textField p5" style="width: 50px;" value="';
        vHtml += PopupToolsCtr.number_control;
        vHtml += '"></td>';
        vHtml += '</td>';
        vHtml += '</tr>';
        vHtml += '</table>';
        vHtml += '</div>';
      }

      if (PopupToolsCtr.isEdit == true) {
      } else if (aMapType === 'grid') {
        var max_row = 1;
        var max_col = 1;
        if (aControlDetail && aControlDetail.config && typeof aControlDetail.config.attributes.max_row != 'undefined') {
          max_row = aControlDetail.config.attributes.max_row
        }
        if (aControlDetail && aControlDetail.config && typeof aControlDetail.config.attributes.max_col != 'undefined') {
          max_col = aControlDetail.config.attributes.max_col
        }
        if (settingfields.max_row) {
          vHtml += '<div">';
          vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
          vHtml += '<tr>';
          vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_ITEM_MAX_ROW') + '</td>';
          vHtml += '<td width="150">';
          vHtml += '<input type="number" name="fldMaxRow" class="textField p5" style="width: 50px;" value="';
          vHtml += max_col;
          vHtml += '"></td>';
          vHtml += '</td>';
          vHtml += '</tr>';
          vHtml += '</table>';
          vHtml += '</div>';
        }
        if (settingfields.max_col) {
          vHtml += '<div">';
          vHtml += '<table border = "0" cellspacing = "1" cellpadding = "0" >';
          vHtml += '<tr>';
          vHtml += '<td class="newLabel w120" nowrap="">' + MyLang.getMsg('LBL_ITEM_MAX_COL') + '</td>';
          vHtml += '<td width="150">';
          vHtml += '<input type="number" name="fldMaxCol" class="textField p5" style="width: 50px;" value="';
          vHtml += max_col;
          vHtml += '"></td>';
          vHtml += '</td>';
          vHtml += '</tr>';
          vHtml += '</table>';
          vHtml += '</div>';
        }
      }

      vHtml += PopupToolsCtr.createHtmlSerialNumber(aControlDetail);

      return vHtml;
    },
    createHtmlListDefaultFields: function (okCreateNewFields) {
      var hasCheckOkCreateNewFields = false;
      if (typeof okCreateNewFields != 'undefined') {
        hasCheckOkCreateNewFields = true;
      }

      function checkOkCreateNewFields(aType) {
        for (var i = 0; i < okCreateNewFields.length; i++) {
          if (aType == okCreateNewFields[i]) {
            return true;
          }
        }
        return false;
      }

      var vHtml = '';
      vHtml += '<table class="tblFieldType" width="100%" border="0" cellspacing="3" cellpadding="0">';

      for (var type in Controller.MapType) {

        if (Controller.MapType[type].show != true) continue;
        if (hasCheckOkCreateNewFields == true && checkOkCreateNewFields(type) == false) continue;

        vHtml += '<tr>';
        vHtml += '<td width="16">';
        vHtml += '<img width="20" height="20" src="' + Controller.MapType[type].iconUrl + '" />';
        vHtml += '</td>';
        vHtml += '<td class="fieldType" map_type="' + type + '">';
        vHtml += Controller.MapType[type].label;
        vHtml += '</td>';
        vHtml += '</tr>';
      }

      vHtml += '</table>';
      return vHtml;
    },
    createEditCtrHtml: function (aControlLabel) {
      var vHtml = '';
      vHtml += '<div class="p5">';

      vHtml += '<form name="CustomFieldForm" method="post">';

      vHtml += '<table width="100%" border="0" cellspacing="10" cellpadding="0">';
      vHtml += '<tbody>';
      vHtml += '<tr>';
      vHtml += '<td class="f17">' + aControlLabel + MyLang.getMsg('MSG_ITEM_SET_ATTRS') + '</td>';
      vHtml += '</tr>';
      vHtml += '<tr>';
      vHtml += '<td valign="top" width="65%">';
      vHtml += '<div id="new_cf_field"></div>';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '</tbody>';
      vHtml += '</table>';
      vHtml += '</form>';

      vHtml += '</div>';
      var elm = document.createElement('div');
      elm.innerHTML = vHtml;
      return elm;
    },
    createCustomFieldHtml: function (aIdNewCfField, okCreateNewFields) {
      if (typeof aIdNewCfField == 'undefined') {
        aIdNewCfField = 'new_cf_field';
      }
      var vHtml = '';

      vHtml += '<div class="p5">';

      vHtml += '<form name="CustomFieldForm" method="post">';

      vHtml += '<table width="100%" border="0" cellspacing="10" cellpadding="0">';
      vHtml += '<tbody>';
      vHtml += '<tr>';
      vHtml += '<td width="200" class="f11b">' + MyLang.getMsg('MSG_ITEM_TYPE_SELECT') + ' </td>';
      vHtml += '<td class="f11b">' + MyLang.getMsg('MSG_ITEM_SET_ATTRS') + '</td>';
      vHtml += '</tr>';
      vHtml += '<tr>';
      vHtml += '<td height="300" valign="top" width="21%">';

      vHtml += PopupToolsCtr.createHtmlListDefaultFields(okCreateNewFields);


      vHtml += '</td>';
      vHtml += '<td valign="top" width="69%">';

      vHtml += '<div id="' + aIdNewCfField + '"></div>';

      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '</tbody>';
      vHtml += '</table>';

      vHtml += '</form>';

      vHtml += '</div>';
      var elm = document.createElement('div');
      elm.innerHTML = vHtml;
      return elm;
    }
  };

  TabOne = {
    create: function (idTab) {
      var vHtml = '';
      vHtml += '<div id="tabs-1">';
      vHtml += '<div id="template_body_html_builder_result" style="display: none;"></div>';
      vHtml += '<div id="result" class="p10 bgWhite">';
      vHtml += '<div class="p0">';
      vHtml += '<div class="content">' + MyLang.getMsg('MSG_EDITOR_TAB_EXP');
      vHtml += '</div>';
      vHtml += '<div><br>';
      vHtml += '<table cellpadding="5" cellspacing="0">';
      vHtml += '<tbody>';
      vHtml += '<tr>';
      vHtml += '<td>';
      vHtml += '<div class="newSelect" style="display: none">';
      vHtml += '<select id="templatelist">';
      vHtml += '</select>';
      vHtml += '</div>';

      vHtml += '</td>';
      vHtml += '<td class="alignright pL10">';
      vHtml += '<input type="button" class="newgraybtn" value="' + MyLang.getMsg('BTN_SECTION_ADD_NEW') + ' " onclick="MainLayout.getSecDetails()"></td>';
      vHtml += '<td class="alignright">';
      vHtml += '<input type="button" class="newgraybtn" value="' + MyLang.getMsg('LBL_ITEM_ADD_NEW') + ' " onclick="MainLayout.showCreateNewCF();">';
      vHtml += '</td>';

      vHtml += '</tr>';
      vHtml += '</tbody>';
      vHtml += '</table><br>';
      vHtml += '<div id="layoutMain" class="pwie">';
      vHtml += '<div class="pwie">';
      vHtml += '<table width="100%" cellpadding="10" cellspacing="0">';
      vHtml += '<tbody>';
      vHtml += '<tr>';
      //vHtml += '<td width="60%" valign="top">';
      vHtml += '<td valign="top" style="min-width: 70%;">';
      vHtml += '<div id="mainMatrix" class="ui-sortable">';
      vHtml += '</div>';
      vHtml += '<div id="sateraito_form_script_render">';
      vHtml += '</div>';
      vHtml += '<div class="clearL"></div>';
      vHtml += '</td>';
      vHtml += '<!-- trash -->';
      //vHtml += '<td valign="top" width="40%">';
      vHtml += '<td valign="top" width="30%">';
      vHtml += '<table id="main_sortable_trash" width="100%" cellspacing="0" style="margin-left: 5px;">';
      vHtml += '<tr><td class="infoHdrBlk x-panel-header x-unselectable" style="cursor: default">';
      vHtml += '<b class="floatL" style="padding-right:10px;">' + MyLang.getMsg('MSG_EDITOR_NOT_DISPLAY_LIST') + '</b>';
      vHtml += '<img style="float:right;" class="infoHdrDelIc pointer" onclick="MainLayout.deleteForeverTrash(this)" src="' + BASE_URL + '/images/icons/spacer.gif" alt="' + MyLang.getMsg('MSG_ITEM_DELETE_PERMANET') + '" title="' + MyLang.getMsg('MSG_ITEM_DELETE_PERMANET') + '">';
      vHtml += '</td></tr>';
      vHtml += '<tr><td style="border: 1px solid #8db2e3;border-top: none;-webkit-box-shadow: 1px 2px 3px #f5f5f5;-moz-box-shadow: 1px 2px 3px #f5f5f5;-o-box-shadow: 1px 2px 3px #f5f5f5;box-shadow: 1px 2px 3px #f5f5f5;">';
      vHtml += '<div id="sortable_trash" class="unwantCntBlk droptrue"></div>';
      vHtml += '</div>';
      vHtml += '</td></tr>';
      vHtml += '</table>';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '</tbody>';
      vHtml += '</table>';
      vHtml += '</div>';
      vHtml += '<div class="clearL"></div><br>';
      vHtml += '<table cellspacing="10" width="100%" cellpadding="0" class="buttonLayer">';
      vHtml += '<tbody>';
      vHtml += '<tr>';
      vHtml += '<td style="min-width:350px;">';
      vHtml += '<input onclick="ViewSource.beforePostMessage()" type="button" class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_COMPLETE') + '"> &nbsp;';
      vHtml += '<input onclick="MainLayout.saveTemplate()" type="button"  class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_PRIVEW') + '"> &nbsp;';
      vHtml += '<input onclick="MainLayout.nextTab(\'2\');" type="button"  class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_HTML_CONFIRM') + '"> &nbsp;';
      vHtml += '</td>';


      vHtml += '<td class="alignright pL10">';
      vHtml += '<div class="newSelect" style="display: block">';
      vHtml += '  <select id="op_default_template_list">';
      vHtml += '  </select>';
      vHtml += '</div>';
      vHtml += '</td>';
      vHtml += '<td class="alignleft pL10">';
      vHtml += '<input id="update_c_t" onclick="MyPanel.runUpdateCurrentTemplate(this)" type="button" class="newgraybtn update_c_t" value="' + MyLang.getMsg('RUN_UPDATE_CURRENT_TEMPLATE') + '"> &nbsp;';
      vHtml += '</td>';
      vHtml += '<td class="alignleft pL10">';
      vHtml += '<input id="load_s_t" onclick="MyPanel.runLoadSectionTemplate(this)" type="button" class="newgraybtn update_c_t" value="' + MyLang.getMsg('RUN_LOAD_SECTION_TEMPLATE') + '"> &nbsp;';
      vHtml += '</td>';

      vHtml += '</tr>';
      vHtml += '</tr>';
      vHtml += '<tr>';
      vHtml += '<td><span style="color: red;">' + MyLang.getMsg('MSG_EDITOR_COMPLETE_EXP') + '</span>';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '</tbody>';
      vHtml += '</table>';
      vHtml += '<br></div>';
      vHtml += '</div>';
      vHtml += '</div>';
      vHtml += '</div>';
      vHtml += '</div>';
      var mainPanel = new Ext.Panel({
        frame: false,
        border: false,
        margins: {top: 0, right: 5, bottom: 0, left: 5},
        html: vHtml,
        autoScroll: true
      });

      return new Ext.Panel({
        layout: 'fit',
        frame: false,
        border: false,
        items: [mainPanel],
        height: 460,
        listeners: {
          afterrender: function () {
            (function () {
              MainLayout.init();
              // Move Box Trash when scroll
              $($('#tabs-1')[0].parentNode).scroll(function () {
                $('#main_sortable_trash').css({
                  position: 'relative',
                  top: $(this).scrollTop()
                })
              });
            }).defer(10);
          }
        }
      });
    }
  };

  TabTwo = {
    create: function (idTab) {
      var vHtml = '';
      vHtml += '<div id="tabs-2">';
      vHtml += '<div id="template_body" class="main_body" style="font-size:13px;padding:0px;">';
      vHtml += '<div class="document_back">';
      vHtml += '<div class="document_body">';

      // 上のタイトル部
      vHtml += '<table border="0" cellpadding="0" cellspacing="0" class="title_table" style="width:100%;">';
      vHtml += '<tr background="' + SATERAITO_MY_SITE_URL + '/images/header_bga02.gif" style="background-repeat: no-repeat;">';
      vHtml += '<td width="49" height="40">';
      vHtml += '<img src="' + SATERAITO_MY_SITE_URL + '/images/header_marka.gif" border="0" style="background-repeat: no-repeat;"></td>';
      vHtml += '<td background="' + SATERAITO_MY_SITE_URL + '/images/header_bga01.gif" class="header_bga01" nowrap height="40"  style="background-repeat: repeat-x;">';
      vHtml += '<font size="4" color="#ffffff" face="メイリオ,Meiryo,Hiragino Kaku Gothic Pro,ヒラギノ角ゴ Pro W3,ＭＳ Ｐゴシック">';
      vHtml += '<b class="template_name">' + $('#template_name').val() + '</b></font>';
      vHtml += '</td>';
      vHtml += '<td background="' + SATERAITO_MY_SITE_URL + '/images/header_bga02.gif" width="6" height="40" style="background-repeat: no-repeat;"></td>';
      vHtml += '</tr>';
      vHtml += '</table>';

//      vHtml += '<table border="0" cellpadding="0" cellspacing="0" class="title_table" style="width:100%;">';
//      vHtml += '<tr background="' + SATERAITO_MY_SITE_URL + '/images/header_bga02.gif" style="background-repeat: no-repeat;">';
//      vHtml += '<td width="49" height="40">';
//      vHtml += '<img src="' + SATERAITO_MY_SITE_URL + '/images/header_marka.gif" border="0">';
//      vHtml += '</td>';
//      vHtml += '<td background="' + SATERAITO_MY_SITE_URL + '/images/header_bga01.gif" class="header_bga01" nowrap height="40" style="background-repeat: no-repeat;">';
//      vHtml += '<font size="4" color="#ffffff" face="メイリオ,Meiryo,Hiragino Kaku Gothic Pro,ヒラギノ角ゴ Pro W3,ＭＳ Ｐゴシック">';
//      vHtml += '<span id="doc_title_render_area_new_doc"><input type="text" size="20" autocomplete="off" id="doc_title_new_doc" name="doc_title_new_doc" class="x-form-text x-form-field x-form-empty-field" style="font-size: 18px; font-weight: bold; width: 392px; height: 22px;" placeholder="' + MyLang.getMsg('MSG_TEMPLATE_TITLE') + '"></span>';
//      vHtml += '</font>';
//      vHtml += '</td>';
//      vHtml += '<td background="' + SATERAITO_MY_SITE_URL + '/images/header_bga02.gif" style="background-repeat: no-repeat;" width="6" height="40" ></td>';
//      vHtml += '</tr>';
//      vHtml += '</table>';

      vHtml += '<div class="p10 bgWhite">';
      vHtml += '<div class="content">';
      //vHtml += '作成したレイアウトが表示されます。';
      vHtml += '</div>';
      vHtml += '<div>';
      vHtml += '<table cellpadding="5" cellspacing="0">';
      vHtml += '<tbody>';
      vHtml += '<tr>';
      vHtml += '<td>';
      vHtml += '<div class="newSelect" style="display: none">';
      vHtml += '</div>';
      vHtml += '</td>';
      vHtml += '<td class="alignright pL10">';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '</tbody>';
      vHtml += '</table>';

      vHtml += '<div id="form_panel_renderResult_render"></div>';
      vHtml += '</div>';
      vHtml += '<div id="resultHtml" style="display: none"></div>';
      vHtml += '</div>';
      vHtml += '</div>';
      vHtml += '</div>';
      vHtml += '<div class="clearL"></div><br>';
      vHtml += '<table cellspacing="10" width="100%" cellpadding="0" class="buttonLayer">';
      vHtml += '<tbody>';
      vHtml += '<tr>';
      vHtml += '<td>';
      vHtml += '<input onclick="ViewSource.beforePostMessage()" type="button" class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_COMPLETE') + '"> &nbsp;';
      vHtml += '<input onclick="MainLayout.nextTab(\'0\');"  type="button" class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_BACK') + '"> &nbsp;';
      vHtml += '<input onclick="MainLayout.nextTab(\'2\');" type="button" class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_HTML_CONFIRM') + '"> &nbsp;';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '</tr>';
      vHtml += '<tr>';
      vHtml += '<td><span style="color: red;">' + MyLang.getMsg('MSG_EDITOR_COMPLETE_EXP') + '</span>';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '</tbody>';
      vHtml += '</table>';
      vHtml += '<br>';
      vHtml += '</div>';
      var mainPanel = new Ext.Panel({
        frame: false,
        border: false,
        margins: {top: 0, right: 5, bottom: 0, left: 5},
        html: vHtml,
        autoScroll: true
      });

      return new Ext.Panel({
        layout: 'fit',
        frame: false,
        border: false,
        items: [mainPanel],
        height: 460
      });
    }
  };

  TabThree = {
    create: function (idTab) {
      var vHtml = '';
      vHtml += '<div id="tabs-3">';
      vHtml += '<div class="p10 bgWhite">';
      vHtml += '<div class="content">';
      vHtml += MyLang.getMsg('MSG_HTML_SOURCE_TAB_EXP');
      vHtml += '</div>';
      vHtml += '<div>';
      vHtml += '<table cellpadding="5" cellspacing="0">';
      vHtml += '<tbody>';
      vHtml += '<tr>';
      vHtml += '<td>';
      vHtml += '<div class="newSelect" style="display: none">';
      vHtml += '</div>';
      vHtml += '</td>';
      vHtml += '<td class="alignright pL10">';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '</tbody>';
      vHtml += '</table><br>';
      vHtml += '<div style="width: 100%; display: inline-block">';
//      vHtml += '<pre id="viewSource" style="width: 99%;" class="prettyprint lang-html linenums=true">';
      vHtml += '<pre id="viewSource" style="width: 99%;" class="brush: html, js, jscript, javascript, css; toolbar: false;">';
      vHtml += '</pre>';
      vHtml += '</div>';
      vHtml += '</div>';
      vHtml += '<div class="clearL"></div><br>';
      vHtml += '<table cellspacing="10" width="100%" cellpadding="0" class="buttonLayer">';
      vHtml += '<tbody>';
      vHtml += '<tr>';
      vHtml += '<td>';
      vHtml += '<input onclick="ViewSource.beforePostMessage()" type="button" class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_COMPLETE') + '"> &nbsp;';
      vHtml += '<input onclick="MainLayout.nextTab(\'0\');" type="button"  class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_BACK') + '"> &nbsp;';
      vHtml += '<input onclick="MainLayout.nextTab(\'1\');" type="button"  class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_PRIVEW_BACK') + '"> &nbsp;';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '<tr>';
      vHtml += '<td><span style="color: red;">' + MyLang.getMsg('MSG_EDITOR_COMPLETE_EXP') + '</span>';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '</tbody>';
      vHtml += '</table>';
      vHtml += '</div>';
      vHtml += '</div>';
      var mainPanel = new Ext.Panel({
        frame: false,
        border: false,
        margins: {top: 0, right: 5, bottom: 0, left: 5},
        html: vHtml,
        autoScroll: true
      });

      return new Ext.Panel({
        layout: 'fit',
        frame: false,
        border: false,
        items: [mainPanel],
        height: 460
      });
    }
  };

  MyPanel = {
    default_template_list: null,
    hideAd: false,
    tabSet: null,
    basePanel: null,
    tabDefine: [
      {
        name: 'tabs-one',
        displayName: MyLang.getMsg('MSG_HTML_EDITOR_TAB')
      },
      {
        name: 'tabs-two',
        displayName: MyLang.getMsg('MSG_HTML_PREVIEW_TAB')
      },
      {
        name: 'tabs-three',
        displayName: MyLang.getMsg('MSG_HTML_SOURCE_TAB')
      }
    ],
    columnWrap: function (val) {
      return '<div style="white-space:normal !important;">' + val + '</div>';
    },
    /**
     * bindSectionClassHandler
     *
     * 「section_area」クラスの開閉用イベントハンドラ（クリック時のハンドラ）をバインドする
     */
    bindSectionClassHandler: function () {
      // セクションエリアの開閉用イベントハンドラ
      $(document).on('click', 'div.section_area_title', function () {
        var element = this;
        var sectionArea = $(element).parent('div.section_area');
        var img = $(sectionArea).find('img.section_arrow_img');
        var showHideArea = $(sectionArea).find('div.section_show_hide_area');
        var display = $(showHideArea).css('display');
        if (display == 'none') {
          $(showHideArea).show('normal');
          $(img).attr('src', SATERAITO_MY_SITE_URL + '/images/arrowDown.gif');
        } else {
          $(showHideArea).hide('normal');
          $(img).attr('src', SATERAITO_MY_SITE_URL + '/images/arrowRight.gif');
        }
      });
    },
    createTab: function (aTabName, aDisplayName, aPanel) {
      aPanel.region = 'center';
      return new Ext.Panel({
        id: aTabName,
        tabName: aTabName,
        autoWidth: true,
        height: 170,
        title: aDisplayName,
        layout: 'border',
        items: [aPanel],
        listeners: {activate: MyPanel.handlerActivate}
      });
    },
    getHeaderHtml: function () {
      var vHtml = '';
      vHtml += '<div class="builder_header"><img src="' + BASE_URL + '/images/form_builder.png"/><span>';
      vHtml += MyLang.getMsg('MSG_HTML_EDITOR_TITLE') + '[' + $('#template_name').val() + ']';
      vHtml += '</span></div>';
      return vHtml;
    },
    buildPanel: function () {
//      Ext.QuickTips.init();

      var header = {
        deferredRender: false,
        height: 33,
        html: MyPanel.getHeaderHtml(),
        region: 'north',
        border: false
      };

      var footer = {
        deferredRender: false,
        height: 21,
        html: MyPanel.getFooterHtml(),
        region: 'south'
      };

      MyPanel.tabSet = new Ext.TabPanel({
        id: 'tab_set',
        activeTab: 0,
        enableTabScroll: true,
        plain: true,
        items: []
      });
      MyPanel.tabSet.region = 'center';

      mainPanel = new Ext.Panel({
        bodyStyle: 'background-color:white;',
        layout: 'border',
        items: [
          header,
          MyPanel.tabSet
        ]
      });

      MyPanel.basePanel = new Ext.Viewport({
        renderTo: 'html_editor_render',
        layout: 'fit',
        autoWidth: true,
        autoHeight: true,
        style: 'background-color: white;',
        items: [mainPanel]
      });


      Ext.util.CSS.createStyleSheet('.x-tab-strip span.x-tab-strip-text {font-size: ' + (11 + MyPanel.fontSize) + 'px}');
      Ext.util.CSS.createStyleSheet('.x-grid3-hd-row td {font-size: ' + (11 + MyPanel.fontSize) + 'px; line-height:' + (15 + MyPanel.fontSize) + 'px}');
      Ext.util.CSS.createStyleSheet('.x-grid3-row td, .x-grid3-summary-row td {font-size: ' + (11 + MyPanel.fontSize) + 'px; line-height:' + (15 + MyPanel.fontSize) + 'px; vertical-align: middle;}');

      //Ext.util.CSS.createStyleSheet('.x-panel-body {background-color:transparent}');
      //Ext.util.CSS.createStyleSheet('.x-window-body, .x-window-mc {background-color:#fff}');
      Ext.util.CSS.createStyleSheet('a:visited {color: purple}');

      Ext.util.CSS.createStyleSheet('.sateraito {font-size: ' + (12 + MyPanel.fontSize) + 'px}');

      ///Ext.util.CSS.createStyleSheet('.x-grid3-cell-inner, .x-grid3-hd-inner {white-space: normal;}');

      $.each(MyPanel.tabDefine, function () {

        var tabName = this;
        switch (this.name) {
          case MyPanel.tabDefine[0].name:

            var newTab = MyPanel.createTab(tabName.name, tabName.displayName, TabOne.create(tabName.name));
            MyPanel.tabSet.add(newTab);
            break;
          case MyPanel.tabDefine[1].name:
            var newTab = MyPanel.createTab(tabName.name, tabName.displayName, TabTwo.create(tabName.name));
            MyPanel.tabSet.add(newTab);
            break;
          case MyPanel.tabDefine[2].name:
            var newTab = MyPanel.createTab(tabName.name, tabName.displayName, TabThree.create(tabName.name));
            MyPanel.tabSet.add(newTab);
            break;
        }
      });

      MyPanel.tabSet.setActiveTab(MyPanel.tabDefine[0].name);

      // 「section_area」クラスハンドラ
      MyPanel.bindSectionClassHandler();

      // load default template list
      if(!MyPanel.default_template_list) {
        var default_template_list = [];
        var html_options = '';
        html_options += '<option value="">' + MyLang.getMsg('NO_SELECT_TEMAPLTE') + '</option>';
        $.each(JSON.parse($('#default_template_list').val()), function () {
          var template = this;
          if (template.template_name === '') {
            template.template_name = '(' + MyLang.getMsg('NO_SUBJECT') + ')';
          }
          default_template_list.push(template);
					// edit at 2017.01.05 by T.ASAO
          //html_options += '<option value="' + template.template_id + '">' + template.template_name + '</option>';
          html_options += '<option value="' + template.template_id + '">' + escapeHtml(template.template_name) + '</option>';
        });
        MyPanel.default_template_list = default_template_list;
        MyPanel.html_options = html_options;
        $('#op_default_template_list').html(MyPanel.html_options);
//        $('#op_default_template_list').val($('#template_id').val());
        $('.update_c_t').attr('disabled','disabled');
      }else {
        $('#op_default_template_list').html(MyPanel.html_options);
        if (MyPanel.selected_template_id) {
          $('#op_default_template_list').val(MyPanel.selected_template_id);
        }
        if ($('#op_default_template_list').val() == ""){
          $('.update_c_t').attr('disabled','disabled');
        }else{
          $('.update_c_t').removeAttr('disabled');
        }
      }
      $('#op_default_template_list').change(function(){
        if ($(this).val() == ""){
          $('.update_c_t').attr('disabled','disabled');
        }else{
          $('.update_c_t').removeAttr('disabled');
        }
      });
      return true;
    },
    selected_template_id: null,
    runUpdateCurrentTemplate: function(button){
      Ext.Msg.show({
        icon: Ext.MessageBox.QUESTION,
        msg: MyLang.getMsg('RUN_UPDATE_CURRENT_TEMPLATE_CONFIRM'),
        buttons: Ext.Msg.OKCANCEL,
        fn: function(buttonId)
        {
          if (buttonId == 'ok') {
            var template_id = $('#op_default_template_list').val();
            MyPanel.selected_template_id = template_id;
            $(button).attr('disabled', 'disabled');
            Loading.showMessage();
            TemplateList.requestGetTemplateDetail(template_id, function(aJsonData){
              if(aJsonData && aJsonData.status == 'ok'){
                var templateDetail = aJsonData.data;
                $('#template_body').val(templateDetail.template_body);
               	//$('#template_body_for_html_builder').val(templateDetail.template_body_for_html_builder);
                $('#template_body_for_html_builder').val(Base64.encode(templateDetail.template_body_for_html_builder));
                MainLayout.createNewTemplate($('#template_id').val(), $('#template_name').val(), unescapeHtml($('#template_body').val()), unescapeHtml($('#template_body_for_html_builder').val()), function () {
                  MyPanel.basePanel.destroy();
                  setTimeout(function(){
                    MyPanel.buildPanel();
                    Loading.hide();
                  }, 300);
                });
              }
              $(button).removeAttr('disabled');
            })
          }
        }
      });
    },
    runLoadSectionTemplate: function(button){
      var template_id = $('#op_default_template_list').val();
      MyPanel.selected_template_id = template_id;

      $(button).attr('disabled', 'disabled');
      Loading.showMessage();
      TemplateList.requestGetTemplateDetail(template_id, function(aJsonData){
        if(aJsonData && aJsonData.status == 'ok'){
          Loading.hide();
          var templateDetail = aJsonData.data;
          if(templateDetail.template_body_for_html_builder == ""){
            Ext.Msg.show({
              icon: Ext.MessageBox.INFO,
              msg: templateDetail.template_name + ' ' + MyLang.getMsg('MSG_TEMPLATE_BUILDER_DATA_IS_EMPTY'),
              buttons: Ext.Msg.OK
            });
            return;
          }
          MyPanel._runLoadSectionTemplate( JSON.parse( JSON.parse(templateDetail.template_body_for_html_builder).template_list_json_string ) );
        }
        $(button).removeAttr('disabled');
      })
    },
    _runLoadSectionTemplate: function(templateDetail){

      var win = Ext.getCmp('dlg_load_section_template');
      if (!win) {
        var buttons = [];

        buttons.push(
          new Ext.Button({
            id: 'btnDlg_dlg_load_section_template',
            text: MyLang.getMsg('BTN_ADD'),
            handler: function () {

              $('#dlg_load_section_template_content').find('input[type="checkbox"]:checked').each(function(){

                var section = templateDetail.sections[parseInt($(this).val())];
                // re-new control id
                MyPanel.processReNewId(section);
                MainLayout.createSection(section);
              });
              var win = Ext.getCmp('dlg_load_section_template');
              if (win) {
                win.close();
              }
            }
          })
        );
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_CANCEL'),
            handler: function () {
              var win = Ext.getCmp('dlg_load_section_template');
              if (win) {
                win.close();
              }
            }
          })
        );
        win = new Ext.Window({
          id: 'dlg_load_section_template',
          title: MyLang.getMsg('TITLE_SECTION_LIST'),
          layout: 'fit',
          width: 400,
          height: 500,
          closeAction: 'hide',
          plain: true,
          modal: true,
          items: [
            {
              xtype: 'panel',
              html: '<div id="dlg_load_section_template_content" style="padding: 10px 10px;"></div>'
            }
          ],
          buttons: buttons,
          listeners: {
            afterRender: function (win) {
              $.each(templateDetail.sections, function(idx, section){
                $('#dlg_load_section_template_content').append('<div><input type="checkbox" value="' + idx + '"> ' + section.secname + '</div>');
              });
            },
            hide: function () {
              var win = Ext.getCmp('dlg_load_section_template');
              if (win) {
                win.close();
              }
            }
          }
        });
      }
      win.show();
    },
    processReNewId: function(section){
      var section_id = MainLayout.createNewSectionId();
      section.section_id = section_id;

      function callback(control){
        if(control.config && control.config.items){
          if(control.map_type_control == 'grid'){
            for(key in control.config.items.items){
              $.each(control.config.items.items[key].ctrs, function(){
                var control = this;
                control.section_id = section_id;
                control.control_id = MainLayout.createNewControlId();
                callback(control);
              });
            }
          }else{
            $.each(control.config.items, function(){
              var control = this;
              control.section_id = section_id;
              control.control_id = MainLayout.createNewControlId();
              callback(control);
            });
          }
        }
      }
      $.each(section.controls, function(){
        var control = this;
        control.section_id = section_id;
        control.control_id = MainLayout.createNewControlId();
        callback(control);
      });
    },
    handlerActivate: function (tab) {
      switch (tab.id) {
        case MyPanel.tabDefine[0].name:
          break;
        case MyPanel.tabDefine[1].name:
          RenderLayout.init();
          break;
        case MyPanel.tabDefine[2].name:
          ViewSource.init();
          break;
      }
    },
    getFooterHtml: function () {
      var vHtmlLink = '<span>link</span>';

      return vHtmlLink;
    }
  };

  debugLog(' ++++ Init: SATERAITO HTML BUILDER !!! ++++ ');
  // init
  // ツールチップ初期化
  Ext.QuickTips.init();

  MyLang.setLocale(SATERAITO_LANG);

  MiniMessage.initMessageArea();

	var timer_id;
	var timer_id2;
	var alertGadgetTimeout = function(){
		try{
			debugLog('[alert]');
			debugLog(new Date());
			clearTimeout(timer_id);
			MiniMessage.showLoadingMessage(MyLang.getMsg('ALERT_GADGET_TIMEOUT'));	// タイムアウトメッセージは消さない
			timer_id2 = setTimeout(function(){notificationGadgetTimeout()}, 10 * 60 * 1000);		// each 10 minuts
		}catch(e){
		}
	};
	var notificationGadgetTimeout = function(){
		try{
			debugLog('[alert]');
			debugLog(new Date());
			clearTimeout(timer_id2);
			MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
		}catch(e){
		}
	};

	// GoogleSitesガジェット認証タイムアウト（1時間）を直前でアラートする機能
	function processGadGetTimeOut(){
		// iFrame版はガジェットタイムアウトが不要なので 2016.03.26 T.ASAO
		if(GADGET_START_TIME < 0){
			return;
		}
    var now = new Date();
    var time_now = now.getTime();
//    GADGET_START_TIME = time_now - (59 * 60 * 1000) - (50*1000);
//    GADGET_START_TIME = time_now - (49 * 60 * 1000) - (50*1000);
    var elapsed_time = time_now - GADGET_START_TIME;
    var period_of_time = 60 * 60 * 1000; // 60 minuts
    var time_remaining = period_of_time - elapsed_time;
//    console.log(GADGET_START_TIME);
//    console.log(time_now);
//    console.log(elapsed_time);
//    console.log(period_of_time);
//    console.log(time_remaining);
    var distaince
		debugLog('[start]');
		debugLog('period_of_time = ' + time_remaining);
    if(time_remaining < 0){
      MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
    }else {
      if (time_remaining > (10 * 60 * 1000)) {
        timer_id = setTimeout(function () { alertGadgetTimeout() }, time_remaining - (10 * 60 * 1000));	// each time_remaining - (10 * 60 * 1000) minuts
      } else {
        timer_id2 = setTimeout(function(){notificationGadgetTimeout()}, time_remaining);		// each time_remaining minuts
      }
    }
	}

  processGadGetTimeOut();

  Loading = {
    showMessage: function(aMsg){
      if(typeof aMsg == 'undefined'){
        aMsg = MyLang.getMsg('LOADING');
      }
      Loading.mask = new Ext.LoadMask(Ext.getBody(), {msg: aMsg});
      Loading.mask.show();
    },
    hide: function(){
      Loading.mask.hide();
    }
  }

  MainLayout.createNewTemplate($('#template_id').val(), $('#template_name').val(), unescapeHtml($('#template_body').val()), unescapeHtml($('#template_body_for_html_builder').val()), function () {
    MyPanel.buildPanel();
  });


  GridUtil = {
    color: {
      cell: '#9BB3DA'
    },
    // debug: show_index is true
    show_index: true,

    createControlInCellGrid: function (cell, section_id) {
      var html = '';
      var ctrsCell = cell.getControls();
      for (var i = 0; i < ctrsCell.length; i++) {
        html += MainLayout.createHtmlDivControl(section_id, ctrsCell[i]);
      }
      return html;
    },
    createObjToGridClass: function (obj) {
      for (var key in obj.items) {
        var item = obj.items[key];
        obj.items[key] = new CellClass({
          rowspan: item.rowspan,
          colspan: item.colspan,
          style: item.style == undefined ? '' : item.style,
          ctrs: item.ctrs
        });
      }
      return new GridClass({
        maxRow: obj.maxRow,
        maxCol: obj.maxCol,
        items: obj.items
      });
    },
    get_status_grid: function (aGrid) {
      var hasSelected = false;
      var countSelected = 0;
      var cellsSelected = [];
      var cells = $(aGrid).find('.cell-sortable');
      $.each(cells, function () {
        if ($(this).hasClass('selected')) {
          hasSelected = true;
          cellsSelected.push(this);
          countSelected++;
        }
      });
      return {
        has_selected: hasSelected,
        count_selected: countSelected,
        cells_selected: cellsSelected,
        cells: cells
      }
    },
    handlerOnClick: function (e) {
      if (e.target.className != "droptrue ui-sortable" && e.target != e.currentTarget) {
        return;
      }
      GridUtil.cell_init(this);
    },
    cell_init: function (c) {
      if ($(c).hasClass('selected')) {
        GridUtil.mark(false, c);
      } else {
        GridUtil.mark(true, c);
      }
    },

    /**
     * Method sets or removes mark from table cell. It can be called on several ways:
     * with direct cell address (cell reference or cell id) or with cell coordinates (row and column).
     * @param {Boolean} flag If set to true then TD will be marked, otherwise table cell will be cleaned.
     * @param {HTMLElement|String} el Cell reference or id of table cell. Or it can be table reference or id of the table.
     * @param {Integer} [row] Row of the cell.
     * @param {Integer} [col] Column of the cell.
     * @example
     * // set mark to the cell with "mycell" reference
     * table.mark(true, mycell);
     *
     * // remove mark from the cell with id "a1"
     * table.mark(false, "a1");
     *
     * // set mark to the cell with coordinates (1,2) on table with reference "mytable"
     * table.mark(true, mytable, 1, 2);
     *
     * // remove mark from the cell with coordinates (4,5) on table with id "t3"
     * table.mark(false, "t3", 4, 5);
     * @public
     * @function
     * @name table#mark
     */
    mark: function (flag, el, row, col) {
      var me = this;
      // cell list with new coordinates
      var cl;
      // first parameter "flag" should be boolean (if not, then return from method
      if (typeof(flag) !== 'boolean') {
        return;
      }
      // test type of the second parameter (it can be string or object)
      if (typeof(el) === 'string') {
        // set reference to table or table cell (overwrite input el parameter)
        el = document.getElementById(el);
      }
      // if el is not string and is not an object then return from the method
      else if (typeof(el) !== 'object') {
        return;
      }
      if (!flag) {
        $(el).removeClass("selected");
      } else {
        $(el).addClass("selected");
      }

      // at this point, el should be an object - so test if it's TD or TABLE
      if (el.nodeName === 'TABLE') {
        // prepare cell list
        cl = me.cell_list(el);
        // set reference to the cell (overwrite input el parameter)
        el = cl[row + '-' + col];
      }
      // if el doesn't exist (el is not set in previous step) or el is not table cell either then return from method
      if (!el || el.nodeName !== 'TD') {
        return;
      }
      // if custom property "redips" doesn't exist then create custom property
      el.redips = el.redips || {};
      // if color property is string, then TD background color will be changed (me.color.cell can be set to false)
      if (typeof(me.color.cell) === 'string') {
        // mark table cell
        if (flag === true) {
          // remember old color
          el.redips.background_old = el.style.backgroundColor;
          // set background color
          //el.style.backgroundColor = me.color.cell;
        }
        // umark table cell
        else {
          // return original background color and reset selected flag
          //el.style.backgroundColor = el.redips.background_old;
        }
      }
      // set flag (true/false) to the cell "selected" property
      el.redips.selected = flag;
    },
    /**
     * Determining a table cell's X and Y position/index.
     * @see <a href="http://www.javascripttoolbox.com/temp/table_cellindex.html">http://www.javascripttoolbox.com/temp/table_cellindex.html</a>
     * @see <a href="http://www.barryvan.com.au/2012/03/determining-a-table-cells-x-and-y-positionindex/">http://www.barryvan.com.au/2012/03/determining-a-table-cells-x-and-y-positionindex/</a>
     * @private
     * @memberOf table#
     */
    cell_list: function (table) {
      var matrix = [],
        matrixrow,
        lookup = {},
        c,			// current cell
        ri,			// row index
        rowspan,
        colspan,
        firstAvailCol,
        tr,			// TR collection
        i, j, k, l;	// loop variables
      // set HTML collection of table rows
      tr = table.rows;
      // open loop for each TR element
      for (i = 0; i < tr.length; i++) {
        // open loop for each cell within current row
        for (j = 0; j < tr[i].cells.length; j++) {
          // define current cell
          c = tr[i].cells[j];
          // set row index
          ri = c.parentNode.rowIndex;
          // define cell rowspan and colspan values
          rowspan = c.rowSpan || 1;
          colspan = c.colSpan || 1;
          // if matrix for row index is not defined then initialize array
          matrix[ri] = matrix[ri] || [];
          // find first available column in the first row
          for (k = 0; k < matrix[ri].length + 1; k++) {
            if (typeof(matrix[ri][k]) === 'undefined') {
              firstAvailCol = k;
              break;
            }
          }
          // set cell coordinates and reference to the table cell
          lookup[ri + '-' + firstAvailCol] = c;
          for (k = ri; k < ri + rowspan; k++) {
            matrix[k] = matrix[k] || [];
            matrixrow = matrix[k];
            for (l = firstAvailCol; l < firstAvailCol + colspan; l++) {
              matrixrow[l] = 'x';
            }
          }
        }
      }
      return lookup;
    },

    merge: function (mode, clear, table) {
      var me = this;
      debugLog('* MERGE: START');
      var tbl,		// table array (loaded from tables array or from table input parameter)
        tr,			// row reference in table
        c,			// current cell
        rc1,		// row/column maximum value for first loop
        rc2,		// row/column maximum value for second loop
        marked,		// (boolean) marked flag of current cell
        span,		// (integer) rowspan/colspan value
        id,			// cell id in format "1-2", "1-4" ...
        cl,			// cell list with new coordinates
        t,			// table reference
        i, j,		// loop variables
        first = {index: -1,	// index of first cell in sequence
          span: -1};		// span value (colspan / rowspan) of first cell in sequence

      tbl = table;

      // define cell list with new coordinates
      cl = me.cell_list(tbl);
      // define row number in current table
      tr = tbl.rows;
      // define maximum value for first loop (depending on mode)
      rc1 = (mode === 'v') ? me.max_cols(tbl) : tr.length;
      // define maximum value for second loop (depending on mode)
      rc2 = (mode === 'v') ? tr.length : me.max_cols(tbl);

      var $ctrElm = $(table).parent();
      var template_id = MainLayout.elmTemplateList.val();
      var section_id = $ctrElm.attr('section_id');
      var control_id = $ctrElm.attr('id');
      var control = TemplateList.getControlDetail(template_id, section_id, control_id);
      var itemsGridClass = control.config.items;

      // first loop
      for (i = 0; i < rc1; i++) {
        // reset marked cell index and span value
        first.index = first.span = -1;
        // second loop
        for (j = 0; j <= rc2; j++) {
          // set cell id (depending on horizontal/verical merging)
          id = (mode === 'v') ? (j + '-' + i) : (i + '-' + j);
          // if cell with given coordinates (in form like "1-2") exists, then process this cell
          if (cl[id]) {
            // set current cell
            c = cl[id];
            // if custom property "redips" doesn't exist then create custom property
            c.redips = c.redips || {};
            // set marked flag for current cell
            marked = c ? c.redips.selected : false;
            // set opposite span value
            span = (mode === 'v') ? c.colSpan : c.rowSpan;
          }
          else {
            marked = false;
          }
          // if first marked cell in sequence is found then remember index of first marked cell and span value
          if (marked === true && first.index === -1) {
            first.index = j;
            first.span = span;
          }
          // sequence of marked cells is finished (naturally or next cell has different span value)
          else if ((marked !== true && first.index > -1) || (first.span > -1 && first.span !== span)) {
            // merge cells in a sequence (cell list, row/column, sequence start, sequence end, horizontal/vertical mode)
            me.merge_cells(cl, i, first.index, j, mode, clear, itemsGridClass);
            // reset marked cell index and span value
            first.index = first.span = -1;
            // if cell is selected then unmark and reset marked flag
            // reseting marked flag is needed in case for last cell in column/row (so merge_cells () outside for loop will not execute)
            if (marked === true) {
              // if clear flag is set to true (or undefined) then clear marked cell after merging
              if (clear === true || clear === undefined) {
                me.mark(false, c);
              }
              marked = false;
            }
          }
          // increase "j" counter for span value (needed for merging spanned cell and cell after when index is not in sequence)
          if (cl[id]) {
            j += (mode === 'v') ? c.rowSpan - 1 : c.colSpan - 1;
          }
        }
        // if loop is finished and last cell is marked (needed in case when TD sequence include last cell in table row)
        if (marked === true) {
          me.merge_cells(cl, i, first.index, j, mode, clear, itemsGridClass);
        }
      }
      // show cell index (if show_index public property is set to true)
      //me.cell_index(table);
      debugLog('* MERGE: END');
    },
    /**
     * Method displays cellIndex for each cell in tables. It is useful in debuging process.
     * @param {Boolean} flag If set to true then cell content will be replaced with cell index.
     * @public
     * @function
     * @name table#cell_index
     */
    cell_index: function (table, flag) {
      var me = this;
      // if input parameter isn't set and show_index private property is'nt true, then return
      // input parameter "flag" can be undefined in case of internal calls
      if (flag === undefined && me.show_index !== true) {
        return;
      }
      // if input parameter is set, then save parameter to the private property show_index
      if (flag !== undefined) {
        // save flag to the show_index private parameter
        me.show_index = flag;
      }
      // variable declaration
      var tr,			// number of rows in a table
        c,			// current cell
        cl,			// cell list
        cols,		// maximum number of columns that table contains
        i, j;	// loop variables
      // define row number in current table
      tr = table.rows;
      // define maximum number of columns (table row may contain merged table cells)
      cols = me.max_cols(table);
      // define cell list
      cl = me.cell_list(table);
      // open loop for each row
      for (i = 0; i < tr.length; i++) {
        // open loop for every TD element in current row
        for (j = 0; j < cols; j++) {
          // if cell exists then display cell index
          if (cl[i + '-' + j]) {
            // set reference to the current cell
            c = cl[i + '-' + j];
            // set innerHTML with cellIndex property
            c.innerHTML = (me.show_index) ? i + '-' + j : '';
          }
        }
      }
    },
    /**
     * Method returns number of maximum columns in table (some row may contain merged cells).
     * @param {HTMLElement|String} table TABLE element.
     * @private
     * @memberOf table#
     */
    max_cols: function (table) {
      var tr = table.rows,	// define number of rows in current table
        span,				// sum of colSpan values
        max = 0,			// maximum number of columns
        i, j;				// loop variable
      // open loop for each TR within table
      for (i = 0; i < tr.length; i++) {
        // reset span value
        span = 0;
        // sum colspan value for each table cell
        for (j = 0; j < tr[i].cells.length; j++) {
          span += tr[i].cells[j].colSpan || 1;
        }
        // set maximum value
        if (span > max) {
          max = span;
        }
      }
      // return maximum value
      return max;
    },
    /**
     * Method relocates element nodes from source cell to the target table cell.
     * It is used in case of merging table cells.
     * @param {HTMLElement} from Source table cell.
     * @param {HTMLElement} to Target table cell.
     * @private
     * @memberOf table#
     */
    relocate: function (from, to) {
      var cn,		// number of child nodes
        i, j;	// loop variables
      // test if "from" cell is equal to "to" cell then do nothing
      if (from === to) {
        return;
      }
      // define childnodes length before loop
      cn = from.childNodes[0].childNodes.length;
      // loop through all child nodes in table cell
      // 'j', not 'i' because NodeList objects in the DOM are live
      for (i = 0, j = 0; i < cn; i++) {
        // relocate only element nodes
        if (from.childNodes[0].childNodes[j].nodeType === 1) {
          to.childNodes[0].appendChild(from.childNodes[0].childNodes[j]);
        }
        // skip text nodes, attribute nodes ...
        else {
          j++;
        }
      }
    },
    /**
     * Method merges and deletes table cells in sequence (horizontally or vertically).
     * @param {Object} cl Cell list (output from cell_list method)
     * @param {Integer} idx Row/column index in which cells will be merged.
     * @param {Integer} pos1 Cell sequence start in row/column.
     * @param {Integer} pos2 Cell sequence end in row/column.
     * @param {String} mode Merge type: h - horizontally, v - vertically. Default is "h".
     * @param {Boolean} [clear] true - cells will be clean (without mark) after merging, false -  cells will remain marked after merging. Default is "true".
     */
    merge_cells: function (cl, idx, pos1, pos2, mode, clear, itemsGridClass) {
      var me = this;
      var span = 0,	// set initial span value to 0
        id,			// cell id in format "1-2", "1-4" ...
        fc,			// reference of first cell in sequence
        c,			// reference of current cell
        i,
        row_index,
        col_index,
        ctrsTmp,
        ctrs = [];			// loop variable
      // set reference of first cell in sequence
      fc = (mode === 'v') ? cl[pos1 + '-' + idx] : cl[idx + '-' + pos1];

      // delete table cells and sum their colspans
      for (i = pos1 + 1; i < pos2; i++) {
        // set cell id (depending on horizontal/verical merging)
        id = (mode === 'v') ? (i + '-' + idx) : (idx + '-' + i);
        // if cell with given coordinates (in form like "1-2") exists, then process this cell
        if (cl[id]) {
          // define next cell in column/row
          row_index = (mode === 'v') ? (i) : (idx);
          col_index = (mode === 'v') ? (idx) : (i);

          ctrsTmp = itemsGridClass.deleteCell(row_index, col_index);
          if (ctrsTmp && ctrsTmp instanceof Array) {
            ctrs = ctrs.concat(ctrsTmp);
          }

          debugLog("DELETE: cell_" + row_index + '-' + col_index);

          c = cl[id];
          // add colSpan/rowSpan value
          span += (mode === 'v') ? c.rowSpan : c.colSpan;
          // relocate content before deleting cell in merging process
          me.relocate(c, fc);
          // delete cell
          c.parentNode.deleteCell(c.cellIndex);
        }
      }
      // if cell exists
      if (fc !== undefined) {
        // vertical merging
        if (mode === 'v') {
          fc.rowSpan += span;			// set new rowspan value
        }
        // horizontal merging
        else {
          fc.colSpan += span;			// set new rowspan value
        }
        row_index = (mode === 'v') ? (pos1) : (idx);
        col_index = (mode === 'v') ? (idx) : (pos1);
        debugLog("UPDATE: cell_" + row_index + '-' + col_index);
        debugLog(ctrs);
        itemsGridClass.updateCell(row_index, col_index, {rowspan: fc.rowSpan, colspan: fc.colSpan, ctrs: ctrs});

        // if clear flag is set to true (or undefined) then set original background color and reset selected flag
        if (clear === true || clear === undefined) {
          me.mark(false, fc);
        }
      }
    },
    /**
     * Method splits marked table cell only if cell has colspan/rowspan greater then 1.
     * @param {String} mode Split type: h - horizontally, v - vertically. Default is "h".
     * @param {HTMLElement|String} [table] Table id or table reference.
     * @public
     * @function
     * @name table#split
     */
    split: function (mode, table) {
      var me = this;
      var tbl,	// table array (loaded from tables array or from table input parameter)
        tr,		// row reference in table
        c,		// current table cell
        cl,		// cell list with new coordinates
        rs,		// rowspan cells before
        n,		// reference of inserted table cell
        cols,	// number of columns (used in TD loop)
        max,	// maximum number of columns
        t,		// table reference
        i, j,	// loop variables
        get_rowspan;
      // method returns number of rowspan cells before current cell (in a row)
      get_rowspan = function (c, row, col) {
        var rs,
          last,
          i;
        // set rs
        rs = 0;
        // set row index of bottom row for the current cell with rowspan value
        last = row + c.rowSpan - 1;
        // go through every cell before current cell in a row
        for (i = col - 1; i >= 0; i--) {
          // if cell doesn't exist then rowspan cell exists before
          if (cl[last + '-' + i] === undefined) {
            rs++;
          }
        }
        return rs;
      };

      var $ctrElm = $(table).parent();
      var template_id = MainLayout.elmTemplateList.val();
      var section_id = $ctrElm.attr('section_id');
      var control_id = $ctrElm.attr('id');
      var control = TemplateList.getControlDetail(template_id, section_id, control_id);
      var itemsGridClass = control.config.items;

      tbl = table;
      // define cell list with new coordinates
      cl = me.cell_list(tbl);
      // define maximum number of columns in table
      max = me.max_cols(tbl);

      // define row number in current table
      tr = tbl.rows;

      // loop TR
      for (i = 0; i < tr.length; i++) {
        // define column number (depending on mode)
        cols = (mode === 'v') ? max : tr[i].cells.length;
        // loop TD
        for (j = 0; j < cols; j++) {
          // split vertically
          if (mode === 'v') {
            // define current table cell
            c = cl[i + '-' + j];
            // if custom property "redips" doesn't exist then create custom property
            if (c !== undefined) {
              c.redips = c.redips || {};
            }
            // if marked cell is found and rowspan property is greater then 1
            if (c !== undefined && c.redips.selected === true && c.rowSpan > 1) {

              // get rowspaned cells before current cell (in a row)
              rs = get_rowspan(c, i, j);
              // insert new cell at last position of rowspan (consider rowspan cells before)
              n = tr[i + c.rowSpan - 1].insertCell(j - rs);
              // set the same colspan value as it has current cell
              n.colSpan = c.colSpan;
              n.className = 'cell-sortable';
              var cell_key = 'cell_' + (i + c.rowSpan - 1) + '-' + (j - rs);
              n.setAttribute('cell_key',cell_key);
              debugLog('UPDATE:' + cell_key)
              $(n).append('<div class="droptrue ui-sortable" in_grid="true" control_id="' + control_id + '" section_id="' + section_id + '" cell_key="' + cell_key + '"></div>');
              itemsGridClass.createCell((i + c.rowSpan - 1), (j - rs), -1, c.colSpan, []);

              // decrease rowspan of marked cell
              c.rowSpan -= 1;
              cell_key = $(c).attr('cell_key');
              var cell = itemsGridClass.getCellFromKey(cell_key);
              if(cell) {
                cell.setRowSpan(c.rowSpan);
              }

              // add "redips" property to the table cell and optionally event listener
              // me.cell_init(n);
              // recreate cell list after vertical split (new cell is inserted)
              cl = me.cell_list(table);

            }
          }
          // split horizontally
          else {
            // define current table cell
            c = tr[i].cells[j];
            // if custom property "redips" doesn't exist then create custom property
            c.redips = c.redips || {};
            // if marked cell is found and cell has colspan property greater then 1
            if (c.redips.selected === true && c.colSpan > 1) {
              // increase cols (because new cell is inserted)
              cols++;
              // insert cell after current cell
              n = tr[i].insertCell(j + 1);
              // set the same rowspan value as it has current cell
              n.rowSpan = c.rowSpan;
              n.className = 'cell-sortable';
              var cell_key = 'cell_' + (i) + '-' + (j + 1);
              n.setAttribute('cell_key', cell_key);
              debugLog('UPDATE:' + cell_key);
              $(n).append('<div class="droptrue ui-sortable" in_grid="true" control_id="' + control_id + '" section_id="' + section_id + '" cell_key="' + cell_key + '"></div>');
              itemsGridClass.createCell((i), (j + 1), c.rowSpan, -1, []);

              // decrease colspan of marked cell
              c.colSpan -= 1;
              cell_key = $(c).attr('cell_key');
              var cell = itemsGridClass.getCellFromKey(cell_key);
              if(cell) {
                cell.setColSpan(c.colSpan);
              }

              // add "redips" property to the table cell and optionally event listener
              // me.cell_init(n);
            }
          }
          // return original background color and reset selected flag (if cell exists)
          if (c !== undefined) {
            me.mark(false, c);
          }
        }
      }
      // show cell index (if show_index public property is set to true)
      // me.cell_index();
      MainLayout.processInitEvents();
    },
    /**
     * Method splits marked table cell only if cell has colspan/rowspan greater then 1.
     * @param {String} mode Split type: h - horizontally, v - vertically. Default is "h".
     * @param {HTMLElement|String} [table] Table id or table reference.
     * @public
     * @function
     * @name table#split
     */
    split2: function (mode, table) {
      var me = this;
      var tbl,	// table array (loaded from tables array or from table input parameter)
        tr,		// row reference in table
        c,		// current table cell
        cl,		// cell list with new coordinates
        rs,		// rowspan cells before
        n,		// reference of inserted table cell
        cols,	// number of columns (used in TD loop)
        max,	// maximum number of columns
        t,		// table reference
        i, j,	// loop variables
        get_rowspan,
        loop = false,
        cols_selected =[];
      // method returns number of rowspan cells before current cell (in a row)
      get_rowspan = function (c, row, col) {
        var rs,
          last,
          i;
        // set rs
        rs = 0;
        // set row index of bottom row for the current cell with rowspan value
        last = row + c.rowSpan - 1;
        // go through every cell before current cell in a row
        for (i = col - 1; i >= 0; i--) {
          // if cell doesn't exist then rowspan cell exists before
          if (cl[last + '-' + i] === undefined) {
            rs++;
          }
        }
        return rs;
      };

      var $ctrElm = $(table).parent();
      var template_id = MainLayout.elmTemplateList.val();
      var section_id = $ctrElm.attr('section_id');
      var control_id = $ctrElm.attr('id');
      var control = TemplateList.getControlDetail(template_id, section_id, control_id);
      var itemsGridClass = control.config.items;

      tbl = table;
      // define cell list with new coordinates
      cl = me.cell_list(tbl);
      // define maximum number of columns in table
      max = me.max_cols(tbl);

      // define row number in current table
      tr = tbl.rows;

      // loop TR
      for (i = 0; i < tr.length; i++) {
        // define column number (depending on mode)
        cols = (mode === 'v') ? max : tr[i].cells.length;
        // loop TD
        for (j = 0; j < cols; j++) {
          // split vertically
          if (mode === 'v') {
            // define current table cell
            c = cl[i + '-' + j];
            // if custom property "redips" doesn't exist then create custom property
            if (c !== undefined) {
              c.redips = c.redips || {};
            }
            // if marked cell is found and rowspan property is greater then 1
            if (c !== undefined && c.redips.selected === true && c.rowSpan > 1) {

              // get rowspaned cells before current cell (in a row)
              rs = get_rowspan(c, i, j);
              // insert new cell at last position of rowspan (consider rowspan cells before)
              n = tr[i + c.rowSpan - 1].insertCell(j - rs);
              // set the same colspan value as it has current cell
              n.colSpan = c.colSpan;
              n.className = 'cell-sortable';
              var cell_key = 'cell_' + (i + c.rowSpan - 1) + '-' + (j - rs);
              n.setAttribute('cell_key', cell_key);
              debugLog('UPDATE:' + cell_key)
              $(n).append('<div class="droptrue ui-sortable" in_grid="true" control_id="' + control_id + '" section_id="' + section_id + '" cell_key="' + cell_key + '"></div>');
              itemsGridClass.createCell((i + c.rowSpan - 1), (j - rs), -1, c.colSpan, []);

              // decrease rowspan of marked cell
              c.rowSpan -= 1;
              cell_key = $(c).attr('cell_key');
              var cell = itemsGridClass.getCellFromKey(cell_key);
              if(cell) {
                cell.setRowSpan(c.rowSpan);
              }

              // add "redips" property to the table cell and optionally event listener
              // me.cell_init(n);
              // recreate cell list after vertical split (new cell is inserted)
              cl = me.cell_list(table);

              if(c.rowSpan>1){
                me.mark(true, c);
                loop = true;
              }
              cols_selected.push(n);
            }
          }
          // split horizontally
          else {
            // define current table cell
            c = tr[i].cells[j];
            // if custom property "redips" doesn't exist then create custom property
            c.redips = c.redips || {};
            // if marked cell is found and cell has colspan property greater then 1
            if (c.redips.selected === true && c.colSpan > 1) {
              // increase cols (because new cell is inserted)
              cols++;
              // insert cell after current cell
              n = tr[i].insertCell(j + 1);
              // set the same rowspan value as it has current cell
              n.rowSpan = c.rowSpan;
              n.className = 'cell-sortable';
              cell_key_split = $(c).attr('cell_key').split('-');
              colspan = c.colSpan - 1 + parseInt(cell_key_split[1]);
              var cell_key = 'cell_' + (i) + '-' + colspan;
              n.setAttribute('cell_key', cell_key);
              debugLog('UPDATE:' + cell_key);
              $(n).append('<div class="droptrue ui-sortable" in_grid="true" control_id="' + control_id + '" section_id="' + section_id + '" cell_key="' + cell_key + '"></div>');
              itemsGridClass.createCell((i), colspan, c.rowSpan, -1, []);

              // decrease colspan of marked cell
              c.colSpan -= 1;
              cell_key = $(c).attr('cell_key');
              var cell = itemsGridClass.getCellFromKey(cell_key);
              if(cell) {
                cell.setColSpan(c.colSpan);
              }

              if(c.colSpan>1){
                me.mark(true, c);
                loop = true;
              }
              cols_selected.push(n);
              // add "redips" property to the table cell and optionally event listener
              // me.cell_init(n);
            }
          }
          // return original background color and reset selected flag (if cell exists)
          if (c !== undefined) {
            me.mark(false, c);
          }
        }
      }
      // show cell index (if show_index public property is set to true)
      // me.cell_index();
      MainLayout.processInitEvents();

      return {loop:loop, cols:cols_selected};
    },
    asyncItemsGridWithHtml: function(itemsGridClass){

      $.each(itemsGridClass.items, function(){
        var cell = this;
        $.each(cell.ctrs, function(){
          $('#' + this.control_id).attr('pos_row', this.pos_row.toString());
        })
      })

    },
    go_merge: function ($table) {
      var me = this;
      me.merge('h', false, $table[0]);
      me.merge('v', true, $table[0]);
      var $ctrElm = $table.parent();
      var template_id = MainLayout.elmTemplateList.val();
      var section_id = $ctrElm.attr('section_id');
      var control_id = $ctrElm.attr('id');
      var control = TemplateList.getControlDetail(template_id, section_id, control_id);
      var itemsGridClass = control.config.items;
      me.asyncItemsGridWithHtml(itemsGridClass)
    },
    go_split_horizontally: function ($table) {
      var me = this;
      me.split('h', $table[0]);
    },
    go_split_vertically: function ($table) {
      var me = this;
      me.split('v', $table[0]);
    },
    go_unmerge: function ($table) {
      var me = this, loop = true, cols=[], cols1 = [], cols2=[];
      var tbl = $table[0];
      // define cell list with new coordinates
      var cl = me.cell_list(tbl);
      $.each(cl, function(){
        if(this.redips && this.redips.selected === true ) {
          cols.push(this);
        }
      });
      if(cols.length ===0) return;
      cols1=cols.concat([]);
      while(loop==true){
        var obj = me.split2('h', $table[0]);
        loop = obj.loop;
        cols1=cols1.concat(obj.cols);
        $.each(cols1, function(){
          me.mark(true, this);
        });
      }
      $.each(cols1, function(){
        me.mark(true, this);
      });
      loop=true;
      cols2=cols1.concat([]);
      while(loop==true){
        var obj = me.split2('v', $table[0]);
        loop = obj.loop;
        cols2=cols2.concat(obj.cols);
        $.each(cols2, function(){
          me.mark(true, this);
        });
      }
      $.each(cols2, function(){
        me.mark(false, this);
      });
    },
    handlerProcessEditCtrCellGrid: function (elm) {
      var me = this, parent = elm.parentElement;
      if (parent.hasAttributes('in_grid') && parent.getAttribute('in_grid') === 'true') {
        return {
          control_id: parent.getAttribute('control_id'),
          section_id: parent.getAttribute('section_id'),
          cell_key: parent.getAttribute('cell_key')
        };
      }
      return me.handlerProcessEditCtrCellGrid(parent);
    },
    go_edit_ctr_cell_grid: function (_this) {
      var me = this;
      var ctrIdInCell = $(_this).attr('control_id');
      var result = me.handlerProcessEditCtrCellGrid(_this);
      if (result) {
        var template_id = MainLayout.elmTemplateList.val();
        var cell_key = result.cell_key;
        var section_id = result.section_id;
        var control_id = result.control_id;
        var controlGrid = TemplateList.getControlDetail(template_id, section_id, control_id);
        var itemGridClass = controlGrid.config.items;
        var cell = itemGridClass.getCellFromKey(cell_key);
        var ctrsCell = cell.getControls();
        var controlDetails;
        $.each(ctrsCell, function () {
          if (this.control_id === ctrIdInCell) {
            controlDetails = this;
            return false;
          }
        });
        if (controlDetails) {
          PopupToolsCtr.show(controlDetails, function (aJsonData) {
            var sectionDetail = TemplateList.getSectionDetail(template_id, section_id);
            if (aJsonData.mode_delete == true) {
              cell.deleteControl(controlDetails.control_id);
              MainLayout.updateControlInSection(sectionDetail);
              return;
            }
            var map_type = aJsonData.map_type;
            var attributes = aJsonData.attributes;

            controlDetails.map_type_control = map_type;
            controlDetails.config.attributes = attributes;
            if (typeof aJsonData.items != 'undefined') {
              controlDetails.config.items = clone(aJsonData.items);
				Controller.asyncItemsInControls(controlDetails, controlDetails.config.items, section_id);
            }
            if (typeof aJsonData.html != 'undefined') {
              controlDetails.config.html = clone(aJsonData.html);
            }

            if (aJsonData.mode_save_and_copy == true) {
              ctrsCell.keySort(Controller.getObjectSortFromPosCol());
              var controlsTmp = TemplateList.getArrayControlFromColumn(ctrsCell, controlDetails.pos_col);
              var idx = controlsTmp.indexOfObject(controlDetails);
              var controlCopy = clone(controlDetails);
              controlCopy.control_id = MainLayout.createNewControlId();
              controlCopy.config.attributes.name += '_copy';
              controlCopy.config.attributes.lblname += MyLang.getMsg('MSG_COMP_COPY');
              if (typeof controlCopy.items != 'undefined') {
                Controller.asyncItemsInControls(controlCopy, controlCopy.items, section_id);
              }
              $.each(controlsTmp, function () {
                ctrsCell.splice(ctrsCell.indexOfObject(this), 1);
              });

              controlsTmp.splice(idx + 1, 0, controlCopy);

              for (var i = 0; i < controlsTmp.length; i++) {
                var item = controlsTmp[i];
                item.pos_row = i + 1;
              }

              cell.addControls(controlsTmp);
            }

            MainLayout.updateControlInSection(sectionDetail);
          });
        }
      }
    },
    go_edit_grid: function (aGrid) {
      var elm = document.createElement('span');
      elm.setAttribute('control_id', $(aGrid).parent().attr('id'));
      elm.setAttribute('section_id', $(aGrid).parent().attr('section_id'));
      MainLayout.showPopupEditCtr(elm);

      var control_id = $(aGrid).parent().attr('id');
      var section_id = $(aGrid).parent().attr('section_id');
      var controlDetails = TemplateList.findControlIdInTemplate(MainLayout.elmTemplateList.val(), control_id);
      if (controlDetails) {

        PopupToolsCtr.show(controlDetails, function (aJsonData) {
          var template_id = MainLayout.elmTemplateList.val();
          var section_id = controlDetails.section_id;
          if (aJsonData.mode_delete == true) {
            var sectionId = section_id;
            var templateId = MainLayout.elmTemplateList.val();
            var templateName = TemplateList.getTemplateDetail(templateId).name;
            var section = TemplateList.getSectionDetail(templateId, sectionId);
            var controls = section.controls;
            controls.keySort(Controller.getObjectSortFromPosCol());

            var controlsTemp = TemplateList.getArrayControlFromColumn(controls, controlDetails.pos_col);
            $.each(controlsTemp, function () {
              controls.splice(controls.indexOfObject(this), 1);
            });
            var itemSave = controlsTemp.splice(controlDetails.pos_row - 1, 1)[0];

            for (var i = 0; i < controlsTemp.length; i++) {
              var item = controlsTemp[i];
              item.pos_row = i + 1;
            }

            section.controls = section.controls.concat(controlsTemp);
            // TrashTemplate.pushControlToTrash(templateId, templateName, itemSave);
            MainLayout.updateControlInSection(section);
            return;
          }

          var map_type = aJsonData.map_type;
          var attributes = aJsonData.attributes;
          var sectionDetail = TemplateList.getSectionDetail(template_id, section_id);
          controlDetails.map_type_control = map_type;
          controlDetails.config.attributes = attributes;
//          if (typeof aJsonData.items != 'undefined') {
//            controlDetails.config.items = clone(aJsonData.items);
//          }
//          if (typeof aJsonData.html != 'undefined') {
//            controlDetails.config.html = clone(aJsonData.html);
//          }

          if (aJsonData.mode_save_and_copy == true) {
            var controls = sectionDetail.controls;
            controls.keySort(Controller.getObjectSortFromPosCol());
            var controlsTmp = TemplateList.getArrayControlFromColumn(controls, controlDetails.pos_col);
            var idx = controlsTmp.indexOfObject(controlDetails);
            var controlCopy = clone(controlDetails);
            controlCopy.control_id = MainLayout.createNewControlId();
            controlCopy.config.attributes.name += '_copy';
            controlCopy.config.attributes.lblname += MyLang.getMsg('MSG_COMP_COPY');
            if (typeof controlCopy.items != 'undefined') {
              Controller.asyncItemsInControls(controlCopy, controlCopy.items, section_id);
            }
            $.each(controlsTmp, function () {
              controls.splice(controls.indexOfObject(this), 1);
            });
            controlsTmp.splice(idx + 1, 0, controlCopy);

            for (var i = 0; i < controlsTmp.length; i++) {
              var item = controlsTmp[i];
              item.pos_row = i + 1;
            }

            sectionDetail.controls = sectionDetail.controls.concat(controlsTmp);
          }

          MainLayout.updateControlInSection(sectionDetail);
        });

      }
    },
    go_add_control: function (aGrid) {
      var me = this;
      var status = me.get_status_grid(aGrid);
      if (status.count_selected === 1) {
        var $td = $(status.cells_selected[0]);
        var cell_key = $td.attr('cell_key');
        var template_id = MainLayout.elmTemplateList.val();
        var section_id = $(aGrid).parent().attr('section_id');
        var control_id = $(aGrid).parent().attr('id');
        var controlGrid = TemplateList.getControlDetail(template_id, section_id, control_id);
        var itemGridClass = controlGrid.config.items;
        var cell = itemGridClass.getCellFromKey(cell_key);
        var ctrsCell = cell.getControls();

        PopupToolsCtr.show(null, function (aJsonData) {
          var template_id = MainLayout.elmTemplateList.val();
          var map_type = aJsonData.map_type;
          var sectionDetail = TemplateList.getSectionDetail(template_id, section_id);
          var controls = sectionDetail.controls;

          if (map_type === 'grid') {
            Ext.Msg.show({
              icon: Ext.MessageBox.INFO,
              msg: MyLang.getMsg('MSG_CAN_NOT_CREATE_GRID_IN_GRID'),
              buttons: Ext.Msg.OK
            });
            return;
          }

          var column_section = aJsonData.column_section;
          if (map_type == 'serial_number') {
            var serial_number_setting = aJsonData.serial_number_setting;

            var ctrs = [];
            for (var i = 0; i < serial_number_setting.length; i++) {
              var control_id = MainLayout.createNewControlId();
              var control = clone(Controller.MapType['label']);
              control.map_type_control = 'label';
              control.control_id = control_id;
              control.pos_col = -1;
              control.pos_row = ctrsCell.length + 1;

              var lblname = serial_number_setting.custom_name + (i + 1);
              control.config.attributes.lblname = lblname;
              control.config.attributes.style = serial_number_setting.style;
              control.config.attributes.class = serial_number_setting.class;
              ctrs.push(control);
            }
            cell.addControls(ctrs);

          } else {

            var ctrs = [];
            for (var i = 0; i < aJsonData.number_control; i++) {
              var aJsonDataTmp = clone(aJsonData);
              var attributes = aJsonDataTmp.attributes;
              var control_id = MainLayout.createNewControlId();
              var control = {};
              control.control_id = control_id;
              control.map_type_control = map_type;
              control.pos_col = -1;

              control.pos_row = ctrsCell.length + 1;
              control.config = {};
              control.config.attributes = attributes;
              var name = attributes.name != undefined ? attributes.name : '';
              if (i > 0) {
                name += '' + i;
              }
              control.config.attributes.name = name;

              if (typeof aJsonDataTmp.items != 'undefined') {
                var items = aJsonDataTmp.items;
                Controller.asyncItemsInControls(control, items, section_id);
                control.config.items = items;
              }
              if (typeof aJsonDataTmp.html != 'undefined') {
                control.config.html = aJsonDataTmp.html;
              }
              ctrs.push(control);
            }
            cell.addControls(ctrs);
          }
          MainLayout.updateControlInSection(sectionDetail);
        });
      }
    },
    go_stylesheet: function (aGrid) {
      var me = this;
      if (!aGrid) {
        return;
      }
      var status = me.get_status_grid(aGrid);
      if (!status.has_selected) {
        return;
      }
      var cellsSelected = status.cells_selected;
      //var text = prompt("What's your favorite cocktail drink?");
      var $parent = $(aGrid).parent();
      var template_id = MainLayout.elmTemplateList.val();
      var control_id = $parent.attr('id');
      var section_id = $parent.attr('section_id');
      var controlGrid = TemplateList.getControlDetail(template_id, section_id, control_id);
      var itemGridClass = controlGrid.config.items;

      var win = Ext.getCmp('dlg_go_stylesheet_cell');
      if (!win) {
        var buttons = [];

        buttons.push(
          new Ext.Button({
            id: 'btnDlg_dlg_go_stylesheet_cell',
            text: MyLang.getMsg('BTN_SAVE'),
            handler: function () {
              var value = Ext.getCmp('dlg_go_stylesheet_cell_textarea').getValue();
              $.each(cellsSelected, function () {
                // todo
                itemGridClass.updateCellFromKey($(this).attr('cell_key'), {style: value});
                GridUtil.mark(false, this);
              });
              var win = Ext.getCmp('dlg_go_stylesheet_cell');
              if (win) {
                win.close();
              }
            }
          })
        );
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_CANCEL'),
            handler: function () {
              var win = Ext.getCmp('dlg_go_stylesheet_cell');
              if (win) {
                win.close();
              }
            }
          })
        );
        win = new Ext.Window({
          id: 'dlg_go_stylesheet_cell',
          title: MyLang.getMsg('TITLE_EDIT_STYLESHEET_CELL'),
          layout: 'fit',
          width: 300,
          height: 200,
          closeAction: 'hide',
          plain: true,
          modal: true,
          items: [
            {
              xtype: 'textarea',
              id: 'dlg_go_stylesheet_cell_textarea'
            }
          ],
          buttons: buttons,
          listeners: {
            afterRender: function () {
              var cell = itemGridClass.getCellFromKey($(cellsSelected[0]).attr('cell_key'));
              Ext.getCmp('dlg_go_stylesheet_cell_textarea').setValue(cell.getStyle());
            },
            hide: function () {
              var win = Ext.getCmp('dlg_go_stylesheet_cell');
              if (win) {
                win.close();
              }
            }
          }
        });
      }
      win.show();

    },
    go_delete: function (aGrid) {
      var me = this;
      if (!aGrid) {
        return;
      }
      var status = me.get_status_grid(aGrid);
      if (!status.has_selected) {
        return;
      }
      // 最終確認メッセージ表示
      Ext.Msg.show({
        //title: MyLang.getMsg('SATERAITO_BBS'),
        icon: Ext.MessageBox.QUESTION,
        msg: MyLang.getMsg('MSG_DELETE_COMP'),
        buttons: Ext.Msg.OKCANCEL,
        fn: function (buttonId) {
          if (buttonId == 'ok') {
            var cellsSelected = status.cells_selected;
            var $parent = $(aGrid).parent();
            var template_id = MainLayout.elmTemplateList.val();
            var control_id = $parent.attr('id');
            var section_id = $parent.attr('section_id');
            var controlGrid = TemplateList.getControlDetail(template_id, section_id, control_id);
            var itemGridClass = controlGrid.config.items;
            $.each(cellsSelected, function () {
              // todo
              itemGridClass.deleteCellFromKey($(this).attr('cell_key'));
              $(this).remove();
            })
          }
        }
      });

    }
  };

  $.contextMenu({
    selector: 'table[gridEditor=true]',
    build: function ($trigger, e) {
      // this callback is executed every time the menu is to be shown
      // its results are destroyed every time the menu is hidden
      // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
      var status = GridUtil.get_status_grid($trigger);

//      if (!status.has_selected) {
//        return false;
//      }
      var menuItems = {};

      menuItems.go_edit_grid = {
        name: MyLang.getMsg("GO_EDIT_GRID"),
        icon: "go_edit_grid",
        disabled: function (key, opt) {
          var status = GridUtil.get_status_grid(opt.$trigger);
          return status.has_selected;
        }
      };

      menuItems.go_add_control = {
        name: MyLang.getMsg("GO_ADD_CTR_CELL"),
        icon: "add_control_cell",
        disabled: function (key, opt) {
          var status = GridUtil.get_status_grid(opt.$trigger);
          return !(status.count_selected == 1);
        }
      };
      menuItems.go_delete = {
        name: MyLang.getMsg("GO_DELETE_CELL"),
        icon: "go_delete_cell",
        disabled: function (key, opt) {
          var status = GridUtil.get_status_grid(opt.$trigger);
          return !(status.has_selected);
        }
      };
      menuItems.go_merge = {
        name: MyLang.getMsg("GO_MERGE_CELL"),
        icon: "go_merge_cell",
        disabled: function (key, opt) {
          var status = GridUtil.get_status_grid(opt.$trigger);
          return !(status.has_selected && status.count_selected > 1);
        }
      };

//      menuItems.go_split_horizontally = {
//        name: MyLang.getMsg("GO_SPLIT_HORIZONTALLY_CELL"),
//        icon: "go_split_horizontally_cell",
//        disabled: function (key, opt) {
//          var status = GridUtil.get_status_grid(opt.$trigger);
//          return !(status.has_selected);
//        }
//      };
//      menuItems.go_split_vertically = {
//        name: MyLang.getMsg("GO_SPLIT_VERTICALLY_CELL"),
//        icon: "go_split_vertically_cell",
//        disabled: function (key, opt) {
//          var status = GridUtil.get_status_grid(opt.$trigger);
//          return !(status.has_selected);
//        }
//      };

      menuItems.go_unmerge = {
        name: MyLang.getMsg("GO_UNMERGE"),
        icon: "go_split_horizontally_cell",
        disabled: function (key, opt) {
          var status = GridUtil.get_status_grid(opt.$trigger);
          return !(status.has_selected);
        }
      };
      menuItems.go_stylesheet = {
        name: MyLang.getMsg("GO_STYLESHEET_CELL"),
        icon: "go_stylesheet_cell",
        disabled: function (key, opt) {
          var status = GridUtil.get_status_grid(opt.$trigger);
          return !(status.has_selected);
        }
      };

      return {
        callback: function (key, options) {
          // var m = "clicked: " + key;
          // window.console && console.log(m) || alert(m);
          var gridTarget = options.$trigger;
          switch (key) {
            case 'go_edit_grid':
              GridUtil.go_edit_grid(gridTarget);
              break;
            case 'go_add_control':
              GridUtil.go_add_control(gridTarget);
              break;
            case 'go_merge':
              GridUtil.go_merge(gridTarget);
              break;
//            case 'go_split_horizontally':
//              GridUtil.go_split_horizontally(gridTarget);
//              break;
//            case 'go_split_vertically':
//              GridUtil.go_split_vertically(gridTarget);
//              break;
            case 'go_unmerge':
              GridUtil.go_unmerge(gridTarget);
              break;
            case 'go_stylesheet':
              GridUtil.go_stylesheet(gridTarget);
              break;
            case 'go_delete':
              GridUtil.go_delete(gridTarget);
              break;
          }
        },
        items: menuItems
      };
    }
  });
});
