/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module table/commands/inserttablecommand
 */
import { Command } from 'ckeditor5/src/core';

/**
 * The insert table command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'insertTable'` editor command.
 *
 * To insert a table at the current selection, execute the command and specify the dimensions:
 *
 * ```ts
 * editor.execute( 'insertTable', { rows: 20, columns: 5 } );
 * ```
 */
export default class InsertTableCommand extends Command {
    /**
     * @inheritDoc
     */
    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const schema = model.schema;
        this.isEnabled = isAllowedInParent(selection, schema);
    }

    /**
     * Executes the command.
     *
     * Inserts a table with the given number of rows and columns into the editor.
     *
     * @param options.rows The number of rows to create in the inserted table. Default value is 2.
     * @param options.columns The number of columns to create in the inserted table. Default value is 2.
     * @param options.headingRows The number of heading rows. If not provided it will default to
     * {@link module:table/tableconfig~TableConfig#defaultHeadings `config.table.defaultHeadings.rows`} table config.
     * @param options.headingColumns The number of heading columns. If not provided it will default to
     * {@link module:table/tableconfig~TableConfig#defaultHeadings `config.table.defaultHeadings.columns`} table config.
     * @fires execute
     */
    execute(options = {}) {
        const editor = this.editor;
        const model = editor.model;
        const tableUtils = editor.plugins.get('TableUtils');
        const defaultRows = editor.config.get('table.defaultHeadings.rows');
        const defaultColumns = editor.config.get('table.defaultHeadings.columns');
        if (options.headingRows === undefined && defaultRows) {
            options.headingRows = defaultRows;
        }
        if (options.headingColumns === undefined && defaultColumns) {
            options.headingColumns = defaultColumns;
        }
        model.change(writer => {
            const table = tableUtils.createTable(writer, options);

            const element = editor.sourceElement;

            let width = '100%';
            if (element) width = getTableWidth(element);

            writer.setAttribute('tableWidth', width, table);
            model.insertObject(table, null, null, { findOptimalPosition: 'auto' });
            writer.setSelection(writer.createPositionAt(table.getNodeByPath([0, 0, 0]), 0));
        });
    }
}

const getTableWidth = (element) => {
    let width = '100%';

    const exercise = element?.closest('.exercise');
    const component = element?.closest('.component');

    if (exercise?.classList.contains('question')) width = '120mm';
    else if (exercise?.classList.contains('solution')) width = '130mm';
    else if (component?.classList.contains('rich-text')) width = '130mm';
    else if (component?.classList.contains('example')) width = '120mm';

    return width;
};

/**
 * Checks if the table is allowed in the parent.
 */
function isAllowedInParent(selection, schema) {
    const positionParent = selection.getFirstPosition().parent;
    const validParent = positionParent === positionParent.root ? positionParent : positionParent.parent;
    return schema.checkChild(validParent, 'table');
}
