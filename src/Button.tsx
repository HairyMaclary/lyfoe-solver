import React from 'react';
import './Button.css';

interface ButtonProps {
    title: string
}

interface ButtonState {
    isToggled: boolean;
    text: string
}

export class Button extends React.Component<ButtonProps, ButtonState> {
    
    constructor(props: ButtonProps) {
        super(props);
        this.state = {
            isToggled: false,
            text: this.props.title
        }
    }
    
    clickHandler = (): void => {
        const isToggled = !this.state.isToggled;
        let text: string;
        if(isToggled) {
            text = this.state.text + ' clicked';
        }
        else { text = this.props.title };

        this.setState({
            isToggled,
            text
        });
    }

    classes = () => {
        if(this.state.isToggled) {
            return 'Button clicked';
        }
        return 'Button';
    }

    render() {
        return (
            <button
                onClick={() => this.clickHandler()}
                className={this.classes()}
            >
                {this.state.text}
            </ button>
        );
    }
}