import React from 'react'
// import BigCalendar from 'react-big-calendar';
import events from './events'
// import PropTypes from "prop-types";

const propTypes = {}

class Selectable extends React.Component {
    constructor(...args) {
        super(...args)

        this.state = { events }
    }


    handleSelect = ({ start, end }) => {
        const title = window.prompt('New Event name')
        if (title)
            this.setState({
                events: [
                    ...this.state.events,
                    {
                        start,
                        end,
                        title,
                    },
                ],
            })
    }


    render() {
        const { localizer } = this.props
        return (
            <div>
                <BigCalendar
                    selectable
                    localizer={localizer}
                    events={this.state.events}
                    defaultView={BigCalendar.Views.WEEK}
                    scrollToTime={new Date(1970, 1, 1, 6)}
                    defaultDate={new Date(2015, 3, 12)}
                    onSelectEvent={event => alert(event.title)}
                    onSelectSlot={this.handleSelect}
                />
            </div>
        )
    }
}

Selectable.propTypes = propTypes

export default Selectable

// Selectable.propTypes = {
//     classes: PropTypes.object.isRequired
// };
//
// export default Selectable;