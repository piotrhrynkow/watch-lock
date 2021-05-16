import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { map } from 'lodash';
import { removeToken } from '../../store/actions';
import Token from '../../model/token';
import { State } from '../../store';

function TokenList(props: {
  tokens: { [key: string]: Token };
  removeToken: (id: string) => void;
}) {
  const { tokens, removeToken } = props;

  const listTokens = map(tokens, (token: Token) => (
    <tr key={token.id}>
      <td>{token.name}</td>
      <td>{token.repositoryCount}</td>
      <td>
        <FA icon={faTrashAlt} onClick={() => removeToken(token.id)} />
      </td>
    </tr>
  ));

  return (
    <>
      <table className="table-projects">
        <tbody>{listTokens}</tbody>
      </table>
    </>
  );
}

const mapStateToProps = (state: State) => {
  return {
    tokens: state.token.items,
  };
};
export default connect(mapStateToProps, { removeToken })(TokenList);
