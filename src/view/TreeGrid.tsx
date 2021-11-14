import React from "react";

interface IItem {

}

interface ITreeViewProperties {
    items?: IItem[];
}

interface ITreeViewState {

}

export default class TreeGrid extends React.Component<ITreeViewProperties, ITreeViewState> {
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
        const isSelectedItem = index == 0; // TODO
        const hasChildren = false;
        const isExpanded = false; // TODO
        const level = 1; // TODO
        return <tr
            role="row"
            tabIndex={(isSelectedItem) ? 0 : -1}
            aria-expanded={(hasChildren) ? isFocusedOnRows && isExpanded : undefined}
            aria-level={level}
            aria-posinset={index + 1}
            aria-setsize={this.props.items!.length}>
            <td role="gridcell">
                Todo
            </td>
            <td role="gridcell">
                Todo
            </td>
        </tr>;
    }
}