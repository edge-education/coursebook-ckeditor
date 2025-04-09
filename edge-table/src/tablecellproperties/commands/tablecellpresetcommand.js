import TableCellPropertyCommand from './tablecellpropertycommand';

/**
 * The table cell preset command.
 *
 *
 * To change the preset of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellPreset', {
 *  value: 'header'
 * } );
 * ```
 */
export default class TableCellPresetCommand extends TableCellPropertyCommand {
    /**
     * Creates a new `TableCellPresetCommand` instance.
     *
     * @param editor An editor in which this command will be used.
     * @param defaultValue The default value for the "preset" attribute.
     */
    constructor(editor, defaultValue) {
        super(editor, 'tableCellPreset', defaultValue);
    }
}
