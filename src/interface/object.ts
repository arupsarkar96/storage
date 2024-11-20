import { Version } from "./version";

export interface Object {
    oid: number,
    bucket: number,
    filename: string
}

export interface ObjectWithVersion extends Object, Version {

}