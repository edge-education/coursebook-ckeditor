import Command from '@ckeditor/ckeditor5-core/src/command';

export default class EquationsCommand extends Command {
    execute({ value }) {
        const editor = this.editor;
        const selection = editor.model.document.selection;

        editor.model.change((writer) => {
            // Create a <math-live> element with the "val" attribute (and all the selection attributes)...
            const mathLive = writer.createElement('math', {
                ...Object.fromEntries(selection.getAttributes()),
                val: value,
                'read-only': true,
            });

            // ... and insert it into the document. Put the selection on the inserted element.
            editor.model.insertObject(mathLive, null, null, { setSelection: 'on' });
        });
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;

        this.isEnabled = model.schema.checkChild(selection.focus.parent, 'math');
    }
}
