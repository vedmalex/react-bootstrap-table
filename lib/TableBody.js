"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var Const = _interopRequire(require("./Const"));

var TableRow = _interopRequire(require("./TableRow"));

var TableColumn = _interopRequire(require("./TableColumn"));

var TableEditColumn = _interopRequire(require("./TableEditColumn"));

var classSet = _interopRequire(require("classnames"));

var TableBody = (function (_React$Component) {
  function TableBody(props) {
    _classCallCheck(this, TableBody);

    _get(Object.getPrototypeOf(TableBody.prototype), "constructor", this).call(this, props);
    this.state = {
      currEditCell: null,
      selectedRowKey: this._getSelectedKeyFromProp(props)
    };
    this._attachRowSelectFunc();
    this.editing = false;
  }

  _inherits(TableBody, _React$Component);

  _createClass(TableBody, {
    componentDidUpdate: {
      value: function componentDidUpdate(prevProps, prevState) {
        this.props.selectRow.selected = this.state.selectedRowKey;
        this._attachRowSelectFunc();
      }
    },
    componentWillReceiveProps: {
      value: function componentWillReceiveProps(nextProps) {
        if (typeof nextProps.selectRow.selected === "undefined") {
          return;
        }var diff = nextProps.selectRow.selected ? false : true;
        diff = nextProps.selectRow.selected.length != this.state.selectedRowKey.length;
        if (!diff) {
          for (var i = 0; i < nextProps.selectRow.selected.length; i++) {
            if (this.state.selectedRowKey.indexOf(nextProps.selectRow.selected[i]) == -1) {
              diff = true;
              break;
            }
          }
        }
        if (diff) {
          this.setState({
            selectedRowKey: this._getSelectedKeyFromProp(nextProps)
          });
        }
      }
    },
    _getSelectedKeyFromProp: {
      value: function _getSelectedKeyFromProp(prop) {
        var selected = prop.selectRow.selected || [];
        if (prop.selectRow.mode === Const.ROW_SELECT_SINGLE && prop.selectRow.selected) {
          //if row selection is single, just pick the first item in 'selected'
          selected = prop.selectRow.selected.length > 0 ? [prop.selectRow.selected[0]] : [];
        }
        return selected;
      }
    },
    _attachRowSelectFunc: {
      value: function _attachRowSelectFunc() {
        if (this.props.selectRow) {
          this.props.selectRow.__onSelect__ = this.handleSelectRow.bind(this);
          this.props.selectRow.__onSelectAll__ = this.handleSelectAllRow.bind(this);
        }
      }
    },
    render: {
      value: function render() {
        var containerClasses = classSet("table-container");

        var tableClasses = classSet("table", "table-bordered", {
          "table-striped": this.props.striped,
          "table-hover": this.props.hover,
          "table-condensed": this.props.condensed
        });

        var isSelectRowDefined = this._isSelectRowDefined();
        var tableHeader = this.renderTableHeader(isSelectRowDefined);

        var tableRows = this.props.data.map(function (data, r) {
          var tableColumns = this.props.columns.map(function (column, i) {
            var fieldValue = data[column.name];
            if (this.editing && column.name !== this.props.keyField && // Key field can't be edit
            column.editable && // column is editable? default is true, user can set it false
            this.state.currEditCell != null && this.state.currEditCell.rid == r && this.state.currEditCell.cid == i) {
              return React.createElement(
                TableEditColumn,
                { completeEdit: this.handleCompleteEditCell.bind(this),
                  key: i,
                  blurToSave: this.props.cellEdit.blurToSave,
                  rowIndex: r,
                  colIndex: i },
                fieldValue
              );
            } else {
              if (typeof column.format !== "undefined") {
                var formattedValue = column.format(fieldValue, data);
                if (!React.isValidElement(formattedValue)) {
                  formattedValue = React.createElement("div", { dangerouslySetInnerHTML: { __html: formattedValue } });
                }
                return React.createElement(
                  TableColumn,
                  { dataAlign: column.align,
                    key: i,
                    className: column.className,
                    cellEdit: this.props.cellEdit,
                    onEdit: this.handleEditCell.bind(this),
                    width: column.width },
                  formattedValue
                );
              } else {
                return React.createElement(
                  TableColumn,
                  { dataAlign: column.align,
                    key: i,
                    className: column.className,
                    cellEdit: this.props.cellEdit,
                    hidden: column.hidden,
                    onEdit: this.handleEditCell.bind(this),
                    width: column.width },
                  fieldValue
                );
              }
            }
          }, this);
          var selected = this.state.selectedRowKey.indexOf(data[this.props.keyField]) != -1;
          var selectRowColumn = isSelectRowDefined ? this.renderSelectRowColumn(selected) : null;
          return React.createElement(
            TableRow,
            { isSelected: selected, key: r,
              selectRow: isSelectRowDefined ? this.props.selectRow : undefined,
              enableCellEdit: this.props.cellEdit.mode !== Const.CELL_EDIT_NONE },
            selectRowColumn,
            tableColumns
          );
        }, this);

        if (tableRows.length === 0) {
          tableRows.push(React.createElement(
            TableRow,
            { key: "##table-empty##" },
            React.createElement(
              "td",
              { colSpan: this.props.columns.length + (isSelectRowDefined ? 1 : 0),
                style: { textAlign: "center" } },
              "There is no data to display"
            )
          ));
        }

        this.editing = false;
        return React.createElement(
          "div",
          { className: containerClasses },
          React.createElement(
            "table",
            { className: tableClasses },
            tableHeader,
            React.createElement(
              "tbody",
              null,
              tableRows
            )
          )
        );
      }
    },
    renderTableHeader: {
      value: function renderTableHeader(isSelectRowDefined) {
        var selectRowHeader = null;

        if (isSelectRowDefined) {
          var style = {
            width: 35
          };
          selectRowHeader = React.createElement("th", { style: style, key: -1 });
        }
        var theader = this.props.columns.map(function (column, i) {
          var style = {
            display: column.hidden ? "none" : null,
            width: column.width
          };
          return React.createElement("th", { style: style, key: i });
        });

        return React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            selectRowHeader,
            theader
          )
        );
      }
    },
    handleSelectRow: {
      value: function handleSelectRow(rowIndex, isSelected) {
        // console.log("handleRow!!!");
        var key, selectedRow;
        this.props.data.forEach(function (row, i) {
          if (i == rowIndex - 1) {
            key = row[this.props.keyField];
            selectedRow = row;
          }
        }, this);
        var currSelectedRorKey = this.state.selectedRowKey;
        if (this.props.selectRow.mode == Const.ROW_SELECT_SINGLE) {
          currSelectedRorKey = [];
        }
        if (isSelected) {
          currSelectedRorKey.push(key);
        } else {
          currSelectedRorKey = currSelectedRorKey.filter(function (element) {
            return key !== element;
          });
        }
        this.setState({
          selectedRowKey: currSelectedRorKey
        });
        if (this.props.selectRow.onSelect) {
          this.props.selectRow.onSelect(selectedRow, isSelected);
        }
      }
    },
    handleSelectAllRow: {
      value: function handleSelectAllRow(rowKeys) {
        this.setState({
          selectedRowKey: rowKeys
        });
        if (this.props.selectRow.onSelectAll) {
          this.props.selectRow.onSelectAll(rowKeys.length == 0 ? false : true);
        }
      }
    },
    handleSelectRowColumChange: {
      value: function handleSelectRowColumChange(e) {
        if (!this.props.selectRow.clickToSelect || !this.props.selectRow.clickToSelectAndEditCell) {
          this.props.selectRow.__onSelect__(e.currentTarget.parentElement.parentElement.rowIndex, e.currentTarget.checked);
        }
      }
    },
    handleEditCell: {
      value: function handleEditCell(rowIndex, columnIndex) {
        this.editing = true;
        if (this._isSelectRowDefined()) {
          columnIndex--;
        }
        rowIndex--;
        var stateObj = {
          currEditCell: {
            rid: rowIndex,
            cid: columnIndex
          }
        };

        if (this.props.selectRow.clickToSelectAndEditCell) {
          //if edit cell, trigger row selections also
          var selected = this.state.selectedRowKey.indexOf(this.props.data[rowIndex][this.props.keyField]) != -1;
          this.handleSelectRow(rowIndex + 1, !selected);
        }
        this.setState(stateObj);
      }
    },
    handleCompleteEditCell: {
      value: function handleCompleteEditCell(newVal, rowIndex, columnIndex) {
        this.setState({ currEditCell: null });
        if (null != newVal) this.props.cellEdit.__onCompleteEdit__(newVal, rowIndex, columnIndex);
      }
    },
    renderSelectRowColumn: {
      value: function renderSelectRowColumn(selected) {
        if (this.props.selectRow.mode == Const.ROW_SELECT_SINGLE) {
          return React.createElement(
            TableColumn,
            null,
            React.createElement("input", { type: "radio", name: "selection", checked: selected, onChange: this.handleSelectRowColumChange.bind(this) })
          );
        } else {
          return React.createElement(
            TableColumn,
            null,
            React.createElement("input", { type: "checkbox", checked: selected, onChange: this.handleSelectRowColumChange.bind(this) })
          );
        }
      }
    },
    _isSelectRowDefined: {
      value: function _isSelectRowDefined() {
        return this.props.selectRow.mode == Const.ROW_SELECT_SINGLE || this.props.selectRow.mode == Const.ROW_SELECT_MULTI;
      }
    },
    getSelectedRowKeys: {
      value: function getSelectedRowKeys() {
        return this.state.selectedRowKey;
      }
    }
  });

  return TableBody;
})(React.Component);

TableBody.propTypes = {
  data: React.PropTypes.array,
  columns: React.PropTypes.array,
  striped: React.PropTypes.bool,
  hover: React.PropTypes.bool,
  condensed: React.PropTypes.bool,
  keyField: React.PropTypes.string
};
module.exports = TableBody;