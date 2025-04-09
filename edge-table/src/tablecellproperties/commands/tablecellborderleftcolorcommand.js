/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import TableCellPropertyCommand from './tablecellpropertycommand';
import { getSingleValue } from '../../utils/table-properties';

/**
 * The table cell left border color command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellBorderLeftColor'` editor command.
 *
 * To change the border color of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellBorderLeftColor', {
 *   value: '#f00'
 * } );
 * ```
 */
export default class TableCellBorderLeftColorCommand extends TableCellPropertyCommand {
    /**
     * Creates a new `TableCellLeftBorderColorCommand` instance.
     *
     * @param editor An editor in which this command will be used.
     * @param defaultValue The default value of the attribute.
     */
    constructor(editor, defaultValue) {
        super(editor, 'tableCellBorderLeftColor', defaultValue);
    }

    /**
     * @inheritDoc
     */
    _getAttribute(tableCell) {
        if (!tableCell) {
            return;
        }
        const value = getSingleValue(tableCell.getAttribute(this.attributeName));
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
}
