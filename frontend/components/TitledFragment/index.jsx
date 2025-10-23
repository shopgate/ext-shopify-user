import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

/**
 * Just empty fragment that ignores other props passed to it
 *
 * @return {JSX.Element}
 * @constructor
 */
const TitledFragment = ({ children }) => (<Fragment>{children}</Fragment>);

TitledFragment.propTypes = {
  children: PropTypes.oneOfType([PropTypes.any]),
};

TitledFragment.defaultProps = {
  children: '',
};

export default TitledFragment;
