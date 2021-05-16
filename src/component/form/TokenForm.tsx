import React from 'react';
import { connect } from 'react-redux';
import { useForm } from 'react-hook-form';
import Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';
import { addToken } from '../../store/actions';
import Token from '../../model/token';
import AuthorizedRepositoryFetcher from '../../service/github/authorized-repository-fetcher';
// import { joiResolver } from '../../form/resolvers/joi';
import tokenRule from '../../form/rules/token-rule';
import ProgressBar from '../ProgressBar';

const TokenForm = (props: any) => {
  const countRepositories = async (token: string): Promise<number> => {
    const authorizedRepositoryFetcher: AuthorizedRepositoryFetcher = new AuthorizedRepositoryFetcher(
      token
    );
    return authorizedRepositoryFetcher.countRepositories();
  };
  const createFormResolver = () => {
    const schema = Joi.object({ // check if token is in store and unique
      name: Joi.string()
        .required(),
      hash: Joi.string()
        .required()
        .regex(/^[a-z0-9]+$/i)
        // .external((value: any) => tokenRule(value, ['hash'], 'Invalid token')) // TODO bring back after tests
        .messages({
          'string.pattern.base': 'Invalid token pattern'
        }),
    });

    return joiResolver(schema);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: createFormResolver(),
  });
  const onSubmit = async (data: any) => {
    try {
      const token: Token = new Token(data.name, data.hash);
      // token.repositoryCount = await countRepositories(data.hash); // TODO bring back after tests
      props.addToken(token);
      reset();
    } catch (error) {
      // TODO
    }
  };

  return (
    <div>
      <ProgressBar show={isSubmitting} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          {/* Name: <input name="name" ref={register} /> */}
          Name: <input {...register('name')} />
          {errors.name && <span>{errors.name.message}</span>}
        </div>
        <div>
          {/* Token: <input name="hash" ref={register} /> */}
          Token: <input {...register('hash')} />
          {errors.hash && <span>{errors.hash.message}</span>}
        </div>
        <input type="submit" value="Add" disabled={isSubmitting} />
      </form>
    </div>
  );
}

const mapStateToProps = (state: any) => {
  return {
    tokens: state.token.items,
  };
};
export default connect(mapStateToProps, { addToken })(TokenForm);
