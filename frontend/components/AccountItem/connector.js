import { connect } from 'react-redux';
import { openPage } from './actions';

/**
 * Passes down string replacement to pipeline call
 *
 * @param {Function} dispatch Dispatch.
 * @param {string} target The URL to be opened
 * @returns {Object}
 */
const mapDispatchToProps = (dispatch, { target }) => ({
  openAccountPage: () => dispatch(openPage(target)),
});

export default connect(null, mapDispatchToProps);
