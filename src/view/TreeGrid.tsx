import React, { KeyboardEvent, ReactElement } from "react";
import KeyCodes from "../utilities/KeyCodes";

import './TreeGrid.css';

export interface IItem {
    id: any;

    // TODO: support typed data?
    data: any[];

    children?: IItem[];
}

interface IInternalItem extends IItem {
    renderedIndex: number | null;

    children?: IInternalItem[];
    parentId: any | null;
}

interface ITreeViewProperties<T extends { [key: string]: any }> {
    items?: T[];
    headers?: string[];
    renderItem?: (item: T, index: number) => IItem;
}

interface ITreeViewState {
    renderedItems: IInternalItem[];

    selectedIndex: number;
    renderedItemCount: number;

    focusMode: "rows" | "cells";

    expandedItems: number[];
}

interface ITreeViewSnapshot {
    action: "recalculate_render_count"
}

const TABINDEX_DATA_ATTRIBUTE = "data-previous-tabindex";

export default class TreeGrid<T extends { [key: string]: any }> extends React.Component<ITreeViewProperties<T>, ITreeViewState> {
    constructor(props: ITreeViewProperties<T>) {
        super(props);
    }

    public static getDerivedStateFromProps<K extends { [key: string]: any }>(nextProps: ITreeViewProperties<K>, prevState?: ITreeViewState): ITreeViewState {
        const renderedItems = nextProps.items?.map(nextProps.renderItem || TreeGrid.defaultRenderItem) || [];
        const expandedItems = prevState?.expandedItems || [];
        return {
            renderedItems: TreeGrid.convertToInternalItems(renderedItems, 0, null, prevState?.expandedItems).items,

            selectedIndex: prevState?.selectedIndex || 0,
            renderedItemCount: TreeGrid.getRenderedItemCount(renderedItems, expandedItems),

            focusMode: prevState?.focusMode || "rows",

            expandedItems: expandedItems,
        };
    }

    private static defaultRenderItem<K extends { [key: string]: any }>(item: K, index: number): IItem {
        const keys = Object.keys(item);
        return {
            id: index,
            data: keys.map((k) => item[k])
        }
    };

    private static convertToInternalItems(items: IItem[], startingIndex: number, parentId: number | null = null, expandedItems: number[] = []): { index: number, items: IInternalItem[] } {
        const DONT_RENDER_CHILDREN_SIGIL = -1;

        // Do a reduce to actually track the stuff we need throughout this operation.
        return items.reduce<{ index: number, items: IInternalItem[] }>((acc, item, index, array) => {
            const isRendered = acc.index !== DONT_RENDER_CHILDREN_SIGIL;
            const renderedIndex = (isRendered) ? acc.index : DONT_RENDER_CHILDREN_SIGIL;
            const shouldRenderChildren = (isRendered && expandedItems.indexOf(item.id) !== -1);
            const startingRenderIndex = (shouldRenderChildren) ? renderedIndex + 1 : DONT_RENDER_CHILDREN_SIGIL;
            const renderedChildren = this.convertToInternalItems(item.children || [], startingRenderIndex, item.id, expandedItems);
            const internalItem: IInternalItem = {
                id: item.id,
                data: item.data,
                children: renderedChildren.items,
                renderedIndex: renderedIndex,
                parentId: parentId
            };

            return {
                index: (shouldRenderChildren) ? renderedChildren.index : acc.index + 1,
                items: [... acc.items, internalItem],
            };
        }, { index: startingIndex, items: [] });
    }

    private static getRenderedItemCount(list: IItem[], expandedItems: number[]): number {
        return list.reduce<number>((acc, item) => {
            const isExpanded = expandedItems.indexOf(item.id) !== -1;
            if (isExpanded) {
                const childCount = TreeGrid.getRenderedItemCount(item.children || [], expandedItems);
                return acc + 1 + childCount;
            } else {
                return acc + 1;
            }
        }, 0);
    }

    public render = () => {
        const defaultHeaders = Object.keys((this.props.items || [])[0]);
        const headers = this.props.headers || defaultHeaders;

        return <table role="treegrid" cellPadding={0}>
            <thead>
                <tr role="row">
                    {/* Indentation header */}
                    <th>&nbsp;</th>

                    {headers.map((h, i) => {
                        return <th key={i} role="columnheader">{h}</th>
                    })}
                </tr>
            </thead>
            <tbody>
                {this.state.renderedItems.map(this.renderRow)}
            </tbody>
        </table>;
    }

    private renderRow = (item: IInternalItem, index: number, array: IInternalItem[], level = 1): ReactElement =>
    {
        const isFocusedOnRows = this.state.focusMode === "rows";
        const overallIndex = item.renderedIndex!;
        const isSelectedItem = overallIndex === this.state.selectedIndex;
        const hasChildren = item.children && item.children.length !== 0;
        const isExpanded = this.state.expandedItems.indexOf(item.id) !== -1;
        const expansionSymbol = (isExpanded) ? "▾" : "▸";
        const key = item.id;
        const renderChildRow = (item: IInternalItem, index: number, array: IInternalItem[]) => { return this.renderRow(item, index, array, level + 1) };
        return <>
            <tr
                role="row"
                key={key}
                tabIndex={(isSelectedItem) ? 0 : -1}
                aria-expanded={(hasChildren) ? isFocusedOnRows && isExpanded : undefined}
                aria-level={level}
                aria-posinset={index + 1}
                aria-setsize={array.length}
                onClick={(e) => this.selectItem(e.currentTarget, overallIndex)}
                onKeyDown={(e) => this.handleRowKeyDown(e, item)}>
                    <td role="gridcell">
                        {"...".repeat(level - 1)}
                        <button tabIndex={-1}
                            className="expandButton"
                            onClick={(isExpanded)
                                ? () => this.collapseItem(item)
                                : () => this.expandItem(item) }>
                            {(hasChildren) ? expansionSymbol : ""}
                        </button>
                    </td>
                    { item.data.map((d, i) => {
                        const defaultHeaders = Object.keys((this.props.items || [])[0]);
                        const headers = this.props.headers || defaultHeaders;
                        const className = `item-${headers[i] || i}`;

                        return <td role="gridcell" className={className}>
                            {d}
                        </td>;
                    })}
            </tr>
            {isExpanded ? item.children?.map(renderChildRow) : undefined}
        </>;
    }

    public getSnapshotBeforeUpdate(prevProps: Readonly<ITreeViewProperties<T>>, prevState: Readonly<ITreeViewState>): ITreeViewSnapshot | null {
        const didUpdateExpandedItems = this.state.expandedItems.length !== prevState.expandedItems.length;
        const shouldRunComponentDidUpdate = didUpdateExpandedItems;
        if (shouldRunComponentDidUpdate) {
            return {
                action: "recalculate_render_count"
            };
        } else {
            return null;
        }
    }

    public componentDidUpdate(prevProps: Readonly<ITreeViewProperties<T>>, prevState: Readonly<ITreeViewState>, snapshot?: ITreeViewSnapshot): void {
        if (snapshot?.action === "recalculate_render_count") {
            // Recalculate the number of expanded items:
            this.setState({
                renderedItemCount: TreeGrid.getRenderedItemCount(this.state.renderedItems, this.state.expandedItems),
            });
        }
    }

    private handleRowKeyDown = (e: KeyboardEvent<HTMLElement>, targetItem: IInternalItem) => {
        switch (e.key) {
            case KeyCodes.ArrowUp:
                this.selectItem(e.currentTarget, this.state.selectedIndex - 1);
                break;

            case KeyCodes.ArrowDown:
                this.selectItem(e.currentTarget, this.state.selectedIndex + 1);
                break;

            case KeyCodes.Home:
                this.selectItem(e.currentTarget, 0);
                break;

            case KeyCodes.End:
                this.selectItem(e.currentTarget, this.state.renderedItemCount - 1);
                break;

            case KeyCodes.ArrowRight:
                this.expandItem(targetItem);
                break;

            case KeyCodes.ArrowLeft:
                this.collapseItem(targetItem);
                break;

            default:
                console.log(e.key);
        }
    }

    private getTabbableChildren(el: HTMLElement): NodeListOf<Element> {
        // TODO: a more complete list
        const TABBLE_ITEMS = "input:not([tabindex=\"-1\"]):not([disabled]), a[href]"; 

        return el.querySelectorAll(TABBLE_ITEMS);
    }

    // Children that were previously tabbable but we overrode their tabbability.
    // We stored their previous tabindex in a data property.
    private getPreviouslyTabbableChildren(el: HTMLElement): NodeListOf<Element> {
        return el.querySelectorAll(`[${TABINDEX_DATA_ATTRIBUTE}]`);
    }

    private selectItem = (currentTarget: HTMLElement, index: number) => {
        if (index < 0) {
            return;
        }

        if (index >= this.state.renderedItemCount) {
            return;
        }

        // TODO: we use a hacky way to set tabbability for all other elements in the table.
        // TODO: we should set initial tabbability when first loaded.
        const previousTabbable = this.getTabbableChildren(currentTarget.parentElement!);
        previousTabbable.forEach((child) => {
            (child as HTMLElement).setAttribute(TABINDEX_DATA_ATTRIBUTE, (child as HTMLElement).tabIndex.toString());
            (child as HTMLElement).tabIndex = -1;
        })
        
        const newItem = currentTarget.parentElement!.children[index] as HTMLElement;
        newItem.focus();

        // Restore focusability to all the elements within.
        const childrenToMakeTabbable = this.getPreviouslyTabbableChildren(newItem);
        childrenToMakeTabbable.forEach((child) => {
            (child as HTMLElement).tabIndex = parseInt((child as HTMLElement).dataset[TABINDEX_DATA_ATTRIBUTE]!);
        })

        this.setState({
            selectedIndex: index,
        });
    }

    private expandItem = (item: IItem) => {
        // TODO: avoid adding the item to expanded if we already have it there.
        if (!item.children || item.children.length === 0) {
            return;
        }

        this.setState({
            expandedItems: [item.id, ... this.state.expandedItems],
        });
    }

    private collapseItem = (item: IInternalItem) => {
        if (!item.children || item.children.length === 0) {
            if (item.parentId !== null) {
                this.setState({
                    expandedItems: this.state.expandedItems.filter((id) => id !== item.parentId),
                });

                // TODO: select parent ID.
            }
            return;
        }
        
        const isExpandedItem = !!this.state.expandedItems.find((id) => id === item.id);
        if (isExpandedItem) {
            this.setState({
                expandedItems: this.state.expandedItems.filter((id) => id !== item.id),
            });
        } else {
            if (item.parentId !== null) {
                this.setState({
                    expandedItems: this.state.expandedItems.filter((id) => id !== item.parentId),
                });

                // TODO: select parent ID.
            }
        }
    }
}