import CbMediaUi from './cb-media-ui';
import CbMediaEditing from './cb-media-editing';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class CbMedia extends Plugin {
    static get requires() {
        return [CbMediaEditing, CbMediaUi];
    }
}
