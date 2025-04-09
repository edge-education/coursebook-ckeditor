/**
 * @module list/documentlistproperties/documentlistbracketedcommand
 */
import { Command } from 'ckeditor5/src/core';

/**
 * The list reversed command. It changes the `listBracketed` attribute of the selected list items,
 * letting the user to choose the list style of an ordered list.
 * It is used by the {@link module:list/documentlistproperties~DocumentListProperties list properties feature}.
 */
export default class DocumentListBracketedCommand extends Command {
    /**
     * @inheritDoc
     */
    value: boolean | null;

    /**
     * @inheritDoc
     */
    refresh(): void;

    /**
     * Executes the command.
     *
     * @fires execute
     * @param options.bracketed Whether the list should be bracketed.
     */
    execute(options?: {
        bracketed?: boolean;
    }): void;

    /**
     * Checks the command's {@link #value}.
     */
    private _getValue;
}
