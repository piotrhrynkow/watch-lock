import { DepGraph } from 'dependency-graph';
import { difference } from 'lodash';
import {
  ComposerPackModelType,
  PackModelType,
  ProjectModelType,
} from '../model/orm/types';

export default class DependencyTree {
  public static generate(
    projects: ProjectModelType[],
    packs: PackModelType[]
  ): DepGraph<string> {
    const graph: DepGraph<string> = new DepGraph();

    const packNames: string[] = packs.map((pack: PackModelType) => pack.name);

    packNames.forEach((packName: string) => graph.addNode(packName));

    projects.forEach((project: ProjectModelType) => {
      const composerPackNames: string[] = project.composer.composerPacks.map(
        (composerPack: ComposerPackModelType) => composerPack.pack.name
      );
      if (
        project.composer.packName &&
        DependencyTree.hasShared(composerPackNames, packNames)
      ) {
        graph.addNode(project.composer.packName);
      }
    });

    projects.forEach((project: ProjectModelType) => {
      project.composer.composerPacks.forEach(
        (composerPack: ComposerPackModelType) => {
          if (packNames.includes(composerPack.pack.name)) {
            graph.addDependency(
              project.composer.packName as string,
              composerPack.pack.name
            );
          }
        }
      );
    });

    return graph;
  }

  private static findShared<T>(a: T[], b: T[]): T[] {
    return difference(a, difference(a, b));
  }

  private static hasShared<T>(a: T[], b: T[]): boolean {
    return DependencyTree.findShared(a, b).length > 0;
  }
}
