/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module table/commands/inserttabletemplatecommand
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
export default class InsertTableTemplateCommand extends Command {
    /**
     * @inheritDoc
     */
    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const schema = model.schema;
        this.isEnabled = isAllowedInParent(selection, schema);
    }

    execute(templateHtml = {}) {
        const editor = this.editor;
        const model = editor.model;

        model.change((writer) => {
            // Save the current selection position
            const selection = model.document.selection;
            const originalRange = selection.getFirstRange();

            // Convert the HTML template to a model fragment
            const viewFragment = editor.data.processor.toView(templateHtml.toString());
            const modelFragment = editor.data.toModel(viewFragment);

            // Insert at the end of the root
            const root = model.document.getRoot();
            const insertPosition = writer.createPositionAt(root, 'end');
            model.insertContent(modelFragment, insertPosition);

            // Restore the original selection to prevent focusing on the new content
            if (originalRange) writer.setSelection(originalRange);
        });
    }
}

/**
 * Checks if the table is allowed in the parent.
 */
function isAllowedInParent(selection, schema) {
    const positionParent = selection.getFirstPosition().parent;
    const validParent = positionParent === positionParent.root ? positionParent : positionParent.parent;
    return schema.checkChild(validParent, 'table');
}
