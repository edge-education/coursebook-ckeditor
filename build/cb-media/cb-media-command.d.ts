export default class CbMediaCommand extends Command {
    execute({ src, source, caption, hideMeta }: {
        src: any;
        source: any;
        caption: any;
        hideMeta: any;
    }): void;
}
import Command from "@ckeditor/ckeditor5-core/src/command";
