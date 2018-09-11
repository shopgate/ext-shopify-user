import { connect } from 'react-redux';
import { getRedirectLocation } from '@shopgate/pwa-common/selectors/history';

/**
 * Maps the contents of the state to the component props.
 * @param {Object} state The current application state.
 * @return {Object} The extended component props.
 */
const mapStateToProps = (state) => {
  const redirectPath = getRedirectLocation(state) || { pathname: '/' };
  return { redirect: redirectPath.pathname };
};

export default connect(mapStateToProps);
