import { connect } from 'react-redux';

/**
 * Maps the contents of the state to the component props.
 * @param {Object} state The current application state.
 * @return {Object} The extended component props.
 */
const mapStateToProps = state => ({
  redirectLocationPath: state.history.redirectLocation
    ? state.history.redirectLocation.pathname
    : '',
});

export default connect(mapStateToProps);
