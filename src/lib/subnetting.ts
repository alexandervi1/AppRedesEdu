import { SubnetExercise, SubnetResult } from "../types";

const exercises: SubnetExercise[] = [
  { baseNetwork: "192.168.10.0", prefix: 24, newPrefix: 26, targetSubnet: 2 },
  { baseNetwork: "10.10.0.0", prefix: 22, newPrefix: 24, targetSubnet: 3 },
  { baseNetwork: "172.16.4.0", prefix: 23, newPrefix: 25, targetSubnet: 1 },
  { baseNetwork: "192.168.40.0", prefix: 24, newPrefix: 27, targetSubnet: 5 },
  { baseNetwork: "10.0.8.0", prefix: 21, newPrefix: 23, targetSubnet: 2 },
];

export const getSubnetExercise = (seed: number): SubnetExercise => exercises[seed % exercises.length];

const ipToNumber = (ip: string) =>
  ip
    .split(".")
    .map(Number)
    .reduce((acc, octet) => (acc << 8) + octet, 0) >>> 0;

const numberToIp = (value: number) =>
  [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");

const blockSize = (prefix: number) => 2 ** (32 - prefix);

export const solveSubnet = (exercise: SubnetExercise): SubnetResult => {
  const base = ipToNumber(exercise.baseNetwork);
  const size = blockSize(exercise.newPrefix);
  const subnetBase = (base + size * exercise.targetSubnet) >>> 0;
  const broadcast = (subnetBase + size - 1) >>> 0;
  const usableHosts = exercise.newPrefix >= 31 ? 0 : size - 2;

  return {
    subnetAddress: numberToIp(subnetBase),
    broadcastAddress: numberToIp(broadcast),
    firstUsable: usableHosts > 0 ? numberToIp(subnetBase + 1) : numberToIp(subnetBase),
    lastUsable: usableHosts > 0 ? numberToIp(broadcast - 1) : numberToIp(broadcast),
    usableHosts,
    totalSubnets: 2 ** (exercise.newPrefix - exercise.prefix),
  };
};

export const normalizeIp = (value: string) => value.trim().replace(/\s+/g, "");

export const isValidIp = (value: string) => {
  const parts = normalizeIp(value).split(".");
  return (
    parts.length === 4 &&
    parts.every((part) => {
      if (!/^\d+$/.test(part)) return false;
      const octet = Number(part);
      return octet >= 0 && octet <= 255;
    })
  );
};
