import React, { KeyboardEvent } from "react";
import KeyCodes from "../utilities/KeyCodes";

interface IItem {

}

interface ITreeViewProperties {
    items?: IItem[];
}

interface ITreeViewState {
    selectedIndex: number;
}

export default class TreeGrid extends React.Component<ITreeViewProperties, ITreeViewState> {
    constructor(props: ITreeViewProperties) {
        super(props);
        this.state = {
            selectedIndex: 0,
        };
    }


    public render() {
        return <table role="treegrid">
            <thead>

            </thead>
            <tbody>
                {this.props.items?.map(this.renderRow)}
            </tbody>
        </table>;
    }

    private renderRow = (item: IItem, index: number) =>
    {
        const isFocusedOnRows = true; // TODO
        const isSelectedItem = index === this.state.selectedIndex;
        const hasChildren = false;
        const isExpanded = false; // TODO
        const level = 1 // TODO
        const key = index; // TODO
        return <tr
            role="row"
            key={key}
            tabIndex={(isSelectedItem) ? 0 : -1}
            aria-expanded={(hasChildren) ? isFocusedOnRows && isExpanded : undefined}
            aria-level={level}
            aria-posinset={index + 1}
            aria-setsize={this.props.items!.length}
            onKeyDown={this.handleRowKeyDown}>
            <td role="gridcell">
                Todo
            </td>
            <td role="gridcell">
                Todo
            </td>
        </tr>;
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
                this.selectItem(e.currentTarget, this.props.items!.length - 1);
                break;

            default:
                console.log(e.key);
        }
    }

    private getAdjacentElement(el: Element, startingIndex: number, offset: number): Element {
        return el.parentElement!.children[startingIndex + offset];
    }

    private selectItem = (currentTarget: HTMLElement, index: number) => {
        if (index < 0) {
            return;
        }

        if (index >= (this.props.items?.length || 0)) {
            return;
        }

        const newItem = currentTarget.parentElement!.children[index] as HTMLElement;
        newItem.focus();
        this.setState({
            selectedIndex: index
        });
    }
}