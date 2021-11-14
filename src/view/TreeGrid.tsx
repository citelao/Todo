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
    selectedIndex: number;
    renderedItemCount: number;

    focusMode: "rows" | "cells";

    expandedItems: number[];
}

export default class TreeGrid<T extends { [key: string]: any }> extends React.Component<ITreeViewProperties<T>, ITreeViewState> {
    constructor(props: ITreeViewProperties<T>) {
        super(props);
        this.state = {
            selectedIndex: 0,
            renderedItemCount: this.getRenderedItemCount(this.props.items?.map(this.props.renderItem || this.defaultRenderItem) || []),

            // TODO: support changes
            focusMode: "rows",

            expandedItems: [],
        };
    }

    public render = () => {
        const itemRenderer = this.props.renderItem || this.defaultRenderItem;

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
                {this.props.items?.map(itemRenderer).map(this.renderRow)}
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

    private defaultRenderItem = (item: T, index: number): IItem => {
        const keys = Object.keys(item);
        return {
            id: index,
            data: keys.map((k) => item[k])
        }
    };

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
            selectedIndex: index
        });
    }

    private getRenderedItemCount = (list: IItem[]): number => {
        const filterList = list || this.props.items?.map(this.props.renderItem || this.defaultRenderItem) || [];
        return filterList.reduce<number>((acc, item) => {
            const isExpanded = this.state && this.state.expandedItems.indexOf(item.id) !== -1;
            if (isExpanded) {
                const childCount = this.getRenderedItemCount(item.children || []);
                return acc + 1 + childCount;
            } else {
                return acc + 1;
            }
        }, 0);
    }
}