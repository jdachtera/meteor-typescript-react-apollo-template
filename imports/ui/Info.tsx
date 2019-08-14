import React, { Component } from "react";

class Info extends Component {
    render() {
        const links = [];

        return (
            <div>
                <h2>Learn Meteor!</h2>
                <ul>{links.map(link => this.makeLink(link))}</ul>
            </div>
        );
    }

    makeLink(link) {
        return (
            <li key={link._id}>
                <a href={link.url} target="_blank">
                    {link.title}
                </a>
            </li>
        );
    }
}

export default Info;
