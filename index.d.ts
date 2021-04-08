type DefaultExport = {
  install: (on: any) => { name: string };
  setConf: (params: { log: boolean }) => void;
};

declare const toExport: DefaultExport;

export default toExport;
