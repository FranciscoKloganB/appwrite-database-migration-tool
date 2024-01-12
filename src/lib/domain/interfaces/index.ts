type LocalMigrationVO = Readonly<{
  applied: boolean;
  name: string;
  timestamp: number;
}>;

type RemoteMigrationVO = Readonly<{
  $id: string;
  applied: boolean;
  name: string;
  timestamp: number;
}>;

export type { LocalMigrationVO, RemoteMigrationVO };
