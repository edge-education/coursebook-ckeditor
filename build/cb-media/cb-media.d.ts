export default class CbMedia extends Plugin {
    static get requires(): (typeof CbMediaUi)[];
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import CbMediaUi from "./cb-media-ui";
