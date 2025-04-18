/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module table/tablecellproperties/commands/tablecellpropertycommand
 */
import { Command } from 'ckeditor5/src/core';

/**
 * The table cell attribute command.
 *
 * The command is a base command for other table cell property commands.
 */
export default class TableCellPropertyCommand extends Command {
    /**
     * Creates a new `TableCellPropertyCommand` instance.
     *
     * @param editor An editor in which this command will be used.
     * @param attributeName Table cell attribute name.
     * @param defaultValue The default value of the attribute.
     */
    constructor(editor, attributeName, defaultValue) {
        super(editor);
        this.attributeName = attributeName;
        this._defaultValue = defaultValue;
    }

    /**
     * @inheritDoc
     */
    refresh() {
        const editor = this.editor;
        const tableUtils = this.editor.plugins.get('TableUtils');
        const selectedTableCells = tableUtils.getSelectionAffectedTableCells(editor.model.document.selection);
        this.isEnabled = !!selectedTableCells.length;
        this.value = this._getSingleValue(selectedTableCells);
    }

    /**
     * Executes the command.
     *
     * @fires execute
     * @param options.value If set, the command will set the attribute on selected table cells.
     * If it is not set, the command will remove the attribute from the selected table cells.
     * @param options.batch Pass the model batch instance to the command to aggregate changes,
     * for example to allow a single undo step for multiple executions.
     */
    execute(options = {}) {
        const { value, batch } = options;
        const model = this.editor.model;
        const tableUtils = this.editor.plugins.get('TableUtils');
        const tableCells = tableUtils.getSelectionAffectedTableCells(model.document.selection);
        const valueToSet = this._getValueToSet(value);
        model.enqueueChange(batch, (writer) => {
            if (valueToSet) {
                tableCells.forEach((tableCell) => writer.setAttribute(this.attributeName, valueToSet, tableCell));
            } else {
                tableCells.forEach((tableCell) => writer.removeAttribute(this.attributeName, tableCell));
            }
        });
    }

    /**
     * Returns the attribute value for a table cell.
     */
    _getAttribute(tableCell) {
        if (!tableCell) {
            return;
        }
        const value = tableCell.getAttribute(this.attributeName);
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }

    /**
     * Returns the proper model value. It can be used to add a default unit to numeric values.
     */
    _getValueToSet(value) {
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }

    /**
     * Returns a single value for all selected table cells. If the value is the same for all cells,
     * it will be returned (`undefined` otherwise).
     */
    _getSingleValue(tableCells) {
        const firstCellValue = this._getAttribute(tableCells[0]);
        const everyCellHasAttribute = tableCells.every(
            (tableCells) => this._getAttribute(tableCells) === firstCellValue
        );
        return everyCellHasAttribute ? firstCellValue : undefined;
    }
}
