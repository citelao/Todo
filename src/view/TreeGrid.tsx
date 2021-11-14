import React from "react";

interface ITreeViewProperties {
    items?: any[];
}

interface ITreeViewState {

}

export default class TreeGrid extends React.Component<ITreeViewProperties, ITreeViewState> {
    public render() {
        return <table role="treegrid">
            <thead>

            </thead>
            <tbody>
                {this.props.items?.map((item, i) => {
                    const isFocusedOnRows = true; // TODO
                    const isSelectedItem = i == 0; // TODO
                    const hasChildren = false;
                    const isExpanded = false; // TODO
                    const level = 1; // TODO
                    return <tr
                        role="row"
                        tabIndex={(isSelectedItem) ? 0 : -1}
                        aria-expanded={(hasChildren) ? isFocusedOnRows && isExpanded : undefined}
                        aria-level={level}
                        aria-posinset={i + 1}
                        aria-setsize={this.props.items!.length}>
                        <td role="gridcell">
                            Todo
                        </td>
                    </tr>;
                })}
            </tbody>
        </table>;
    }
}