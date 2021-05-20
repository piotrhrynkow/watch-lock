import React from 'react';
import { connect } from 'react-redux';
import Layout from './Layout';
import {
  ComposerPackModelType,
  PackModelType,
  ProjectModelType,
} from '../model/orm/types';
import DependencyTreeService from '../service/dependency-tree';
import { State } from '../store/types';
import {
  selectModelPacksWatched,
  selectModelProjectsWithRelations,
} from '../store/selectors';

function DependencyTree(props: {
  packs: PackModelType[];
  projects: ProjectModelType[];
}) {
  const { packs, projects } = props;

  const graph = DependencyTreeService.generate(projects, packs);
  const packNames: string[] = graph.overallOrder();

  const childPacks: { [key: string]: string[] } = {};
  projects.forEach((project: ProjectModelType) => {
    if (project.composer.packName) {
      const projectPackNames: string[] = project.composer.composerPacks
        .map((composerPack: ComposerPackModelType) => composerPack.pack.name)
        .filter((packName: string) => packName && packNames.includes(packName));
      childPacks[project.composer.packName] = projectPackNames;
    }
  });

  const hasChildrenPacks = (packName: string): boolean => {
    return packName in childPacks && childPacks[packName].length > 0;
  };

  const mapChildrenPacks = (packName: string) => {
    if (hasChildrenPacks(packName)) {
      return childPacks[packName].map((childPackName: string) => (
        <div key={childPackName} className="label">
          {childPackName}
        </div>
      ));
    }
  };

  const mapPacks = packNames.map((packName: string) => (
    <div key={packName} className="row">
      <div className="name">{packName}</div>
      {hasChildrenPacks(packName) && (
        <div className="project">{mapChildrenPacks(packName)}</div>
      )}
    </div>
  ));

  return (
    <>
      <Layout>
        <div className="main">
          <h1>Updating order</h1>
          <div className="list pack">{mapPacks}</div>
        </div>
      </Layout>
    </>
  );
}

const mapStateToProps = (state: State) => {
  return {
    projects: selectModelProjectsWithRelations(state),
    packs: selectModelPacksWatched(state),
  };
};
export default connect(mapStateToProps, {})(DependencyTree);
