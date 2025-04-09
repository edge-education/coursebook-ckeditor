/**
 * @module list/listproperties/listbracketedcommand
 */
import { Command } from 'ckeditor5/src/core';

/**
 * The bracketed list command. It changes the `listBracketed` attribute of the selected list items. As a result, the list style will be
 * bracketed.
 * It is used by the {@link module:list/listproperties~ListProperties list properties feature}.
 */
export default class ListBracketedCommand extends Command {
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
     *
     * @returns The current value.
     */
    private _getValue;
}
