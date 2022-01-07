import Slider from 'rc-slider';

class RatingSlider {
    render() {
        return <Slider
            className='slider'
            trackStyle={{ backgroundColor: 'yellow', height: 10 }}
            style={{
                marginTop: "10vh",
                marginLeft: "3vw",
                marginBottom: "10vh",
                // transform: 'translate(-50%, -50%)',
                width: "44vw",
                fontFamily: "cursive",
                height: "10vh",
                // border: "solid 5px #000",
                // backgroundColor: "white",
            }}
            handleStyle={{
                borderColor: 'white',
                height: 20,
                width: 20,
                // marginLeft: -14,
                // marginBottom: 10,
                backgroundColor: 'black',
            }}
            railStyle={{ backgroundColor: 'red', height: 10 }}
            min={-10}
            max={10}
            step={1}
            disabled={this.state.sliderDisabled}
            value={this.state.selectedValue}
            onChange={this.handleOnChange}
            marks={{
                "-10": {
                    style: { fontSize: "1.3em", color: "black" },
                    label: <div>10<br /> <br /> <br /><strong style={{ color: "red", marginLeft: '3vw' }}>No signal</strong></div>
                },
                "-8": {
                    style: { fontSize: "1.3em", color: "black" },
                    label: -8
                },
                "-6": {
                    style: { fontSize: "1.3em", color: "black" },
                    label: -6
                },
                "-4": {
                    style: { fontSize: "1.3em", color: "black" },
                    label: -4
                },
                "-2": {
                    style: { fontSize: "1.3em", color: "black" },
                    label: -2
                },
                0: {
                    style: { fontSize: "1.3em", color: "black" },
                    label: 0
                },
                2: {
                    style: { fontSize: "1.3em", color: "black" },
                    label: 2
                },
                4: {
                    style: { fontSize: "1.3em", color: "black" },
                    label: 4
                },
                6: {
                    style: { fontSize: "1.3em", color: "black" },
                    label: 6
                },

                8: {
                    style: { fontSize: "1.3em", color: "black" },
                    label: 8
                },

                10: {
                    style: { fontSize: "1.3em", color: "black" },
                    label: <div>10<br /> <br /> <br /><strong style={{ color: "blue" }}>Signal exists</strong></div>
                }
            }}
        />
    }
}

export default RatingSlider