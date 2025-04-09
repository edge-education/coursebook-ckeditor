export default class CbMediaCommand extends Command {
    execute({ src, source, caption }: {
        src: any;
        source: any;
        caption: any;
    }): void;
}
import Command from "@ckeditor/ckeditor5-core/src/command";
