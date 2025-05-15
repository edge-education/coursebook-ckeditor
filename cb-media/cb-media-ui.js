import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import './assets/styles.css';
import MediaIcon from './assets/Media.svg';

export default class CbMediaUi extends Plugin {
    init() {
        const editor = this.editor;

        editor.ui.componentFactory.add('cb-media', () => {
            const button = new ButtonView();

            button.label = 'CB Media';
            button.icon = MediaIcon;
            button.tooltip = true;

            this.listenTo(button, 'execute', () => {
                if (window.bus) {
                    window.bus.openMediaSelectionFromEditor().then(item => {
                        if (item) {
                            const { caption, file, metadata } = item.model;

                            const hideMeta = metadata && metadata.hide_caption ? metadata.hide_caption : false

                            editor.execute('cb-media', { src: file.url, caption, source: file.source, hideMeta });
                        }
                    });
                }
            });

            return button;
        });

    }
}
