import equationsUi from './equations-ui';
import equationsEditing from './equations-editing';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class equations extends Plugin {
    static get requires() {
        return [equationsEditing, equationsUi];
    }
}
