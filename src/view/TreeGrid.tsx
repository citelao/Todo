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
        const isSelectedItem = index == this.state.selectedIndex; // TODO
        const hasChildren = false;
        const isExpanded = false; // TODO
        const level = 1; // TODO
        return <tr
            role="row"
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
                {
                    if (this.state.selectedIndex === 0) {
                        return;
                    }
                    const item = e.target as HTMLElement;
                    const newItem = item.parentElement?.children[this.state.selectedIndex - 1] as HTMLElement;
                    newItem.focus();
                    this.setState({
                        selectedIndex: this.state.selectedIndex - 1
                    });
                }
                break;

            case KeyCodes.ArrowDown:
                {
                    if (this.state.selectedIndex === (this.props.items?.length || 0) - 1) {
                        return;
                    }
                    const item = e.target as HTMLElement;
                    const newItem = item.parentElement?.children[this.state.selectedIndex + 1] as HTMLElement;
                    newItem.focus();
                    this.setState({
                        selectedIndex: this.state.selectedIndex + 1
                    });
                }
                break;

            default:
                console.log(e.key);
        }
    }
}