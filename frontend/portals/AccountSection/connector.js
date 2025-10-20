import { connect } from 'react-redux';
import { isUserLoggedIn } from '@shopgate/engage/user';

/**
 * Maps redux state of a logged in customer to component
 *
 * @param {Object} state State.
 * @returns {Object}
 */
const mapStateToProps = state => ({
  isUserLoggedIn: isUserLoggedIn(state),
});

export default connect(mapStateToProps);
