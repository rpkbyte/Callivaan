/**
 * Agent Configuration Presentation Controller
 */
import { Request, Response, NextFunction } from 'express';
import { AgentService } from '../services/agent.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { CreateAgentConfigSchema } from '@callivaan/shared';
import { log } from '../logger.js';

export class AgentController {
  constructor(private agentService: AgentService = new AgentService()) {}

  getPresets = (_req: Request, res: Response): void => {
    res.json(this.agentService.getPresets());
  };

  listVersions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const versions = await this.agentService.getVersions(authReq.tenant!.id);
      res.json({ versions });
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };

  getActiveConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const active = await this.agentService.getActiveConfig(authReq.tenant!.id);
      res.json(active);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };

  createVersion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const parseResult = CreateAgentConfigSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'ValidationError',
          details: parseResult.error.flatten().fieldErrors,
        });
        return;
      }

      const { settings, changeNote, activateImmediately } = parseResult.data;
      const tenantId = authReq.tenant!.id;

      const newVersion = await this.agentService.createVersion({
        tenantId,
        userId: authReq.user!.id,
        settings,
        changeNote,
        activateImmediately,
        ipAddress: req.ip,
      });

      log('info', 'New agent configuration version created', {
        correlationId: authReq.correlationId,
        tenantId,
        details: { versionNumber: newVersion.versionNumber, isActive: newVersion.isActive },
      });

      res.status(201).json(newVersion);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };

  activateVersion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.tenant!.id;
      const versionId = req.params.id;

      const activated = await this.agentService.activateVersion(
        tenantId,
        versionId,
        authReq.user!.id,
        req.ip
      );

      log('info', 'Agent configuration version activated', {
        correlationId: authReq.correlationId,
        tenantId,
        details: { versionNumber: activated.versionNumber },
      });

      res.json(activated);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };
}
