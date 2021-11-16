import React, { KeyboardEvent, ReactElement } from "react";
import KeyCodes from "../utilities/KeyCodes";

import './TreeGrid.css';

export interface IItem {
    id: any;

    // TODO: support typed data?
    data: any[];

    children?: IItem[];
}

interface ITreeViewProperties<T extends { [key: string]: any }> {
    items?: T[];
    headers?: string[];
    renderItem?: (item: T, index: number) => IItem;
}

interface ITreeViewState {
    renderedItems: IItem[];

    selectedIndex: number;
    renderedItemCount: number;

    focusMode: "rows" | "cells";

    expandedItems: number[];
}

interface ITreeViewSnapshot {
    action: "recalculate_render_count"
}

export default class TreeGrid<T extends { [key: string]: any }> extends React.Component<ITreeViewProperties<T>, ITreeViewState> {
    constructor(props: ITreeViewProperties<T>) {
        super(props);
    }

    public static getDerivedStateFromProps<K extends { [key: string]: any }>(nextProps: ITreeViewProperties<K>, prevState?: ITreeViewState): ITreeViewState {
        const renderedItems = nextProps.items?.map(nextProps.renderItem || TreeGrid.defaultRenderItem) || [];
        const expandedItems = prevState?.expandedItems || [];
        return {
            renderedItems: renderedItems,

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

        return <table role="treegrid">
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

    private renderRow = (item: IItem, index: number, array: IItem[], level = 1): ReactElement =>
    {
        const isFocusedOnRows = this.state.focusMode === "rows";
        const overallIndex = index; // TODO: we need to get the actual overall index here.
        const isSelectedItem = overallIndex === this.state.selectedIndex;
        const hasChildren = item.children && item.children.length !== 0;
        const isExpanded = this.state.expandedItems.indexOf(item.id) !== -1;
        const expansionSymbol = (isExpanded) ? "▾" : "▸";
        const key = item.id;
        const renderChildRow = (item: IItem, index: number, array: IItem[]) => { return this.renderRow(item, index, array, level + 1) };
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
                    <td role="gridcell">{"...".repeat(level)} {(hasChildren) ? expansionSymbol : undefined}</td>
                    { item.data.map((d) => {
                        return <td role="gridcell">
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

    private handleRowKeyDown = (e: KeyboardEvent<HTMLElement>, targetItem: IItem) => {
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
                {
                    // TODO: avoid adding the item to expanded if we already have it there.
                    if (!targetItem.children || targetItem.children.length === 0) {
                        break;
                    }

                    this.setState({
                        expandedItems: [targetItem.id, ... this.state.expandedItems],
                    });
                }
                break;

            case KeyCodes.ArrowLeft:
                {
                    if (!targetItem.children || targetItem.children.length === 0) {
                        // TODO: should collapse up to parent.
                        break;
                    }

                    // TODO: avoid adding the item to expanded if we already have it there.
                    this.setState({
                        expandedItems: this.state.expandedItems.filter((id) => id !== targetItem.id),
                    });
                }
                break;

            default:
                console.log(e.key);
        }
    }

    private selectItem = (currentTarget: HTMLElement, index: number) => {
        if (index < 0) {
            return;
        }

        if (index >= this.state.renderedItemCount) {
            return;
        }

        const newItem = currentTarget.parentElement!.children[index] as HTMLElement;
        newItem.focus();
        this.setState({
            selectedIndex: index,
        });
    }
}