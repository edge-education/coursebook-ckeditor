/**
 * @module list/listproperties/listbracketedcommand
 */
import { Command } from 'ckeditor5/src/core';
import { getSelectedListItems } from '../list/utils';

/**
 * The bracketed list command. It changes the `listBracketed` attribute of the selected list items. As a result, the list style will be
 * bracketed.
 * It is used by the {@link module:list/listproperties~ListProperties list properties feature}.
 */
export default class ListBracketedCommand extends Command {
    /**
     * @inheritDoc
     */
    refresh() {
        const value = this._getValue();
        this.value = value;
        this.isEnabled = value != null;
    }

    /**
     * Executes the command.
     *
     * @fires execute
     * @param options.bracketed Whether the list should be bracketed.
     */
    execute(options = {}) {
        const model = this.editor.model;
        const listItems = getSelectedListItems(model)
            .filter(item => item.getAttribute('listType') == 'numbered');
        model.change(writer => {
            for (const item of listItems) {
                writer.setAttribute('listBracketed', !!options.bracketed, item);
            }
        });
    }

    /**
     * Checks the command's {@link #value}.
     *
     * @returns The current value.
     */
    _getValue() {
        const listItem = this.editor.model.document.selection.getFirstPosition().parent;
        if (listItem && listItem.is('element', 'listItem') && listItem.getAttribute('listType') == 'numbered') {
            return listItem.getAttribute('listBracketed');
        }
        return null;
    }
}
