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
                    const isSelectedItem = i == 0; // TODO
                    return <tr role="row" tabIndex={(isSelectedItem) ? 0 : -1}>
                        <td>
                            Todo
                        </td>
                    </tr>;
                })}
            </tbody>
        </table>;
    }
}