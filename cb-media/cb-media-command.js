import Command from '@ckeditor/ckeditor5-core/src/command';

export default class CbMediaCommand extends Command {
    execute({ src, source, caption }) {
        const editor = this.editor;

        editor.model.change((writer) => {
            const image = writer.createElement('cbMedia', {
                src,
                source,
                caption,
            });

            editor.model.insertObject(image, null, null, { findOptimalPosition: 'auto' });
        });
    }

    refresh() {
        // The command is always enabled as it doesn't care about the actual selection - Image can be inserted
        // even if the selection is elsewhere.
        this.isEnabled = true;
    }
}
