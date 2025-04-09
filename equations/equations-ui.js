import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { MathfieldElement } from 'mathlive';
import Formula from './assets/formula.svg';
import './assets/styles.css';

export default class equationsUi extends Plugin {
    init() {
        const editor = this.editor;
        const model = editor.model;

        editor.model.schema.extend('math', { allowAttributes: 'read-only' });

        MathfieldElement.fontsDirectory = '../mathlive/fonts';
        MathfieldElement.soundsDirectory = '../mathlive/sounds';

        editor.ui.componentFactory.add('equations', () => {
            const button = new ButtonView();

            button.label = 'Equations';
            button.icon = Formula;
            button.tooltip = true;

            this.listenTo(button, 'execute', async () => {
                const selection = model.document.selection;
                const selectedElement = selection.getSelectedElement();
                let selectedLatex = '';
                let latex = '';

                if (selectedElement && selectedElement.hasAttribute('val')) {
                    selectedLatex = selectedElement.getAttribute('val');
                    model.change((writer) => writer.remove(selectedElement));
                }

                try {
                    latex = await launchMathLive(selectedLatex);
                } catch (error) {
                    latex = selectedLatex;
                }

                if (latex.length) {
                    editor.execute('math', { value: latex });
                }

                if (window.bus) window.bus.onRefocusComponent();
            });

            return button;
        });

        const createWrapper = () => {
            let wrapper = document.createElement('div');
            let overlay = document.createElement('div');
            wrapper.className = 'ck math-wrapper';
            overlay.className = 'overlay';
            wrapper.appendChild(overlay);

            return wrapper;
        };

        const createModal = () => {
            let modal = document.createElement('div');
            const heading = document.createElement('h3');
            heading.textContent = 'Add Equation';
            modal.className = 'math-modal';
            modal.appendChild(heading);

            return modal;
        };

        const createCloseButton = () => {
            let close = document.createElement('span');
            close.className = 'cb cb-close';

            return close;
        };

        const createApplyButton = () => {
            let apply = document.createElement('button');
            apply.className = 'apply';
            apply.textContent = 'Apply';

            return apply;
        };

        const createLatexToggle = () => {
            const toggle = document.createElement('p');
            toggle.className = 'toggle';
            toggle.textContent = 'Latex';

            return toggle;
        };

        const createLatexInput = () => document.createElement('textarea');

        const toggleClass = (el, classname) => {
            if (el.classList.contains(classname)) {
                el.classList.remove(classname);
            } else {
                el.classList.add(classname);
            }
        };

        const launchMathLive = (selection = '') =>
            new Promise((resolve, reject) => {
                const body = document.querySelector('body');
                const wrapper = createWrapper();
                const modal = createModal();
                const close = createCloseButton();
                const apply = createApplyButton();
                const mfe = new MathfieldElement();
                const latexToggle = createLatexToggle();
                const latex = createLatexInput();

                mfe.className = 'mfe-wrapper';
                mfe.setAttribute('plonk-sound', null);
                mfe.setAttribute('keypress-sound', null);
                mfe.setAttribute('math-mode-space', '~');
                mfe.setValue(selection);
                latex.value = mfe.value;

                modal.appendChild(close);
                modal.appendChild(mfe);
                modal.appendChild(latexToggle);
                modal.appendChild(latex);
                modal.appendChild(apply);

                mfe.addEventListener('input', (ev) => (latex.value = mfe.value));

                latexToggle.addEventListener('click', () => toggleClass(latex, 'active'));

                latex.addEventListener('input', (ev) =>
                    mfe.setValue(ev.target.value, { focus: false, silenceNotifications: true, scrollIntoView: false })
                );

                close.addEventListener('click', () => {
                    body.removeChild(wrapper);
                    reject(false);
                });

                apply.addEventListener('click', () => {
                    body.removeChild(wrapper);
                    resolve(mfe.value);
                });

                body.appendChild(wrapper);
                wrapper.appendChild(modal);
            });
    }
}
