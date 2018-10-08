/* import React from 'react';
import ReactDOM from 'react-dom';
import Card from 'components/card/card';

export default function () {

    function App() {
        return (<h1>HELO</h1>);
    }

    // ReactDOM.render(<Card />, document.getElementById('main'));
}

class Events extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            events: [],
            isLoading: false,
            error: null,
        };
    }
    // async?
    loadDataEvents() {
        this.setState({ isLoading: true });
        // axios лучше использовать?
        fetch('events.json')
            .then(response => {
                if (response.ok) {
                    response.json();
                } else {
                    throw new Error('Something went wrong ... (fetch evens.json)');
                }
            })
            .then(data => this.setState({ events: data.events, isLoading: false } ))
            .catch(error => this.setState({ error, isLoading: false }));
    }
    render() {
        const { hits, isLoading, error } = this.state;

        if (error) {
            return <p>{error.message}</p>;
        }

        if (isLoading) {
            return <p>Loading ...</p>;
        }

        return (
            <ul>
                {hits.map(hit =>
                    <li key={hit.objectID}>
                        <a href={hit.url}>{hit.title}</a>
                    </li>
                )}
            </ul>
        );
    }
}
*/
