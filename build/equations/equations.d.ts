export default class equations extends Plugin {
    static get requires(): (typeof equationsUi)[];
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import equationsUi from "./equations-ui";
