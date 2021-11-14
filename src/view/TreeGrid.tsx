import React, { KeyboardEvent, ReactElement } from "react";
import KeyCodes from "../utilities/KeyCodes";

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

export default class TreeGrid<T extends { [key: string]: any }> extends React.Component<ITreeViewProperties<T>, ITreeViewState> {
    constructor(props: ITreeViewProperties<T>) {
        super(props);
        // this.state = {
        //     selectedIndex: 0,
        //     renderedItemCount: this.getRenderedItemCount(this.props.items?.map(this.props.renderItem || this.defaultRenderItem) || []),

        //     // TODO: support changes
        //     focusMode: "rows",

        //     expandedItems: [],
        // };
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
                <tr>
                    {/* Indentation header */}
                    <th>&nbsp;</th>

                    {headers.map((h, i) => {
                        return <th key={i}>{h}</th>
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
        const isSelectedItem = index === this.state.selectedIndex;
        const hasChildren = false;
        const isExpanded = this.state.expandedItems.indexOf(item.id) !== -1;
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
                onKeyDown={this.handleRowKeyDown}>
                    <td>{"...".repeat(level)}</td>
                    { item.data.map((d) => {
                        return <td role="gridcell">
                            {d}
                        </td>;
                    })}
            </tr>
            {isExpanded ? item.children?.map(renderChildRow) : undefined}
        </>;
    }


    private handleRowKeyDown = (e: KeyboardEvent<HTMLElement>) => {
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
                    // TODO check contains
                    const selectedItem = this.state.renderedItems[this.state.selectedIndex]!;
                    this.setState({
                        expandedItems: [selectedItem.id, ... this.state.expandedItems],
                        // renderedItemCount: this.getRenderedItemCount(this.props.items?.map(this.props.renderItem || this.defaultRenderItem) || []),
                    });
                }
                break;

            case KeyCodes.ArrowLeft:
                {
                    // TODO check contains
                    const selectedItem = this.state.renderedItems[this.state.selectedIndex]!;
                    this.setState({
                        expandedItems: this.state.expandedItems.filter((id) => id !== selectedItem.id),
                        // renderedItemCount: this.getRenderedItemCount(this.props.items?.map(this.props.renderItem || this.defaultRenderItem) || []),
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