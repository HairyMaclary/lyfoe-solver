import React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
//import { count } from './counter-model'

@observer
export class Counter extends React.Component {

    @observable
    count = 0;

    @action('upping the count')
    increment = () => {
        this.count++;
    }

    @action('dropping the count')
    decrement = () => {
        this.count--;
    }

    render() {
        return (
            <div>
                {this.count} <br/>
                <button onClick={this.increment}>+</button>
                <button onClick={this.decrement}>-</button>
            </div>
        )
    }
}