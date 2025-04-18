/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import type {
    AdjacentListsSupport,
    CheckTodoDocumentListCommand,
    CheckTodoListCommand,
    DocumentList,
    DocumentListBracketedCommand,
    DocumentListCommand,
    DocumentListEditing,
    DocumentListIndentCommand,
    DocumentListMergeCommand,
    DocumentListProperties,
    DocumentListPropertiesEditing,
    DocumentListPropertiesUtils,
    DocumentListReversedCommand,
    DocumentListSplitCommand,
    DocumentListStartCommand,
    DocumentListStyleCommand,
    DocumentListUtils,
    IndentCommand,
    List,
    ListBracketedCommand,
    ListCommand,
    ListConfig,
    ListEditing,
    ListProperties,
    ListPropertiesEditing,
    ListPropertiesUI,
    ListReversedCommand,
    ListStartCommand,
    ListStyle,
    ListStyleCommand,
    ListUI,
    ListUtils,
    TodoDocumentList,
    TodoDocumentListEditing,
    TodoList,
    TodoListEditing,
    TodoListUI
} from '.';

declare module '@ckeditor/ckeditor5-core' {
    interface EditorConfig {
        /**
         * The configuration of the {@link module:list/list~List} feature and the {@link module:list/documentlist~DocumentList} feature.
         *
         * Read more in {@link module:list/listconfig~ListConfig}.
         */
        list?: ListConfig;
    }

    interface PluginsMap {
        [DocumentList.pluginName]: DocumentList;
        [DocumentListEditing.pluginName]: DocumentListEditing;
        [DocumentListProperties.pluginName]: DocumentListProperties;
        [DocumentListPropertiesEditing.pluginName]: DocumentListPropertiesEditing;
        [DocumentListPropertiesUtils.pluginName]: DocumentListPropertiesUtils;
        [DocumentListUtils.pluginName]: DocumentListUtils;
        [AdjacentListsSupport.pluginName]: AdjacentListsSupport;
        [List.pluginName]: List;
        [ListEditing.pluginName]: ListEditing;
        [ListProperties.pluginName]: ListProperties;
        [ListPropertiesEditing.pluginName]: ListPropertiesEditing;
        [ListPropertiesUI.pluginName]: ListPropertiesUI;
        [ListStyle.pluginName]: ListStyle;
        [ListUI.pluginName]: ListUI;
        [ListUtils.pluginName]: ListUtils;
        [TodoList.pluginName]: TodoList;
        [TodoListEditing.pluginName]: TodoListEditing;
        [TodoListUI.pluginName]: TodoListUI;
        [TodoDocumentList.pluginName]: TodoDocumentList;
        [TodoDocumentListEditing.pluginName]: TodoDocumentListEditing;
    }

    interface CommandsMap {
        numberedList: ListCommand | DocumentListCommand;
        bulletedList: ListCommand | DocumentListCommand;
        indentList: IndentCommand | DocumentListIndentCommand;
        outdentList: IndentCommand | DocumentListIndentCommand;
        mergeListItemBackward: DocumentListMergeCommand;
        mergeListItemForward: DocumentListMergeCommand;
        splitListItemBefore: DocumentListSplitCommand;
        splitListItemAfter: DocumentListSplitCommand;
        listStyle: ListStyleCommand | DocumentListStyleCommand;
        listStart: ListStartCommand | DocumentListStartCommand;
        listReversed: ListReversedCommand | DocumentListReversedCommand;
        listBracketed: ListBracketedCommand | DocumentListBracketedCommand;
        todoList: ListCommand | DocumentListCommand;
        checkTodoList: CheckTodoListCommand | CheckTodoDocumentListCommand;
    }
}
