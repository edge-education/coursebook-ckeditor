/**
 * @module list/documentlistproperties/documentlistbracketedcommand
 */
import { Command } from 'ckeditor5/src/core';
import { first } from 'ckeditor5/src/utils';
import { expandListBlocksToCompleteList, isListItemBlock } from '../documentlist/utils/model';

/**
 * The list bracketed command. It changes the `listBracketed` attribute of the selected list items,
 * letting the user to choose the bracketed list style of an ordered list.
 * It is used by the {@link module:list/documentlistproperties~DocumentListProperties list properties feature}.
 */
export default class DocumentListBracketedCommand extends Command {
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
        const document = model.document;
        let blocks = Array.from(document.selection.getSelectedBlocks())
            .filter(block => isListItemBlock(block) && block.getAttribute('listType') == 'numbered');
        blocks = expandListBlocksToCompleteList(blocks);
        model.change(writer => {
            for (const block of blocks) {
                writer.setAttribute('listBracketed', !!options.bracketed, block);
            }
        });
    }

    /**
     * Checks the command's {@link #value}.
     */
    _getValue() {
        const model = this.editor.model;
        const document = model.document;
        const block = first(document.selection.getSelectedBlocks());
        if (isListItemBlock(block) && block.getAttribute('listType') == 'numbered') {
            return block.getAttribute('listBracketed');
        }
        return null;
    }
}
